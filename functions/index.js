const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { Octokit } = require('@octokit/rest');

admin.initializeApp();

const db = admin.firestore();
const storage = admin.storage();

// Configuration from environment
const CONFIG = {
    GITHUB_TOKEN: functions.config().github.token,
    BACKEND_REPO: functions.config().github.repo || 'hasinamusadiq/maseer_automation',
    MAX_CLIENTS: 24
};

// CORS configuration
const cors = require('cors')({ origin: true });

// Check capacity
exports.checkCapacity = functions.https.onCall(async (data, context) => {
    // Verify auth
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Login required');
    }
    
    try {
        // Count clients in Firestore
        const snapshot = await db.collection('registrations').get();
        const current = snapshot.size;
        
        return {
            current,
            max: CONFIG.MAX_CLIENTS,
            remaining: Math.max(0, CONFIG.MAX_CLIENTS - current)
        };
    } catch (error) {
        console.error('Capacity check error:', error);
        throw new functions.https.HttpsError('internal', 'Failed to check capacity');
    }
});

// Create GitHub Issue
exports.createGitHubIssue = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Login required');
    }
    
    const formData = data.data;
    const userId = context.auth.uid;
    
    // Verify user matches
    if (formData.user_id !== userId) {
        throw new functions.https.HttpsError('permission-denied', 'User mismatch');
    }
    
    try {
        // Check capacity first
        const capacity = await db.collection('registrations').get();
        if (capacity.size >= CONFIG.MAX_CLIENTS) {
            throw new functions.https.HttpsError('resource-exhausted', 'Capacity full');
        }
        
        // Create GitHub issue
        const octokit = new Octokit({ auth: CONFIG.GITHUB_TOKEN });
        
        const issueBody = formatIssueBody(formData);
        
        const response = await octokit.rest.issues.create({
            owner: CONFIG.BACKEND_REPO.split('/')[0],
            repo: CONFIG.BACKEND_REPO.split('/')[1],
            title: `New Client: ${formData.brand_name}`,
            body: issueBody,
            labels: ['new-client']
        });
        
        // Store mapping in Firestore
        await db.collection('github_mappings').doc(userId).set({
            issueNumber: response.data.number,
            issueUrl: response.data.html_url,
            brandName: formData.brand_name,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        return {
            success: true,
            issueNumber: response.data.number,
            issueUrl: response.data.html_url
        };
        
    } catch (error) {
        console.error('GitHub API error:', error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});

// HTTP endpoint for backend to notify when video is ready
exports.videoReady = functions.https.onRequest((req, res) => {
    return cors(req, res, async () => {
        if (req.method !== 'POST') {
            return res.status(405).send('Method not allowed');
        }
        
        const authHeader = req.headers.authorization;
        if (authHeader !== `Bearer ${CONFIG.GITHUB_TOKEN}`) {
            return res.status(401).send('Unauthorized');
        }
        
        const { firebaseUid, videoUrl, brandName } = req.body;
        
        try {
            // Store video metadata
            await db.collection('videos').doc(firebaseUid).set({
                status: 'ready',
                downloadUrl: videoUrl,
                brandName: brandName,
                readyAt: admin.firestore.FieldValue.serverTimestamp()
            });
            
            // Update registration status
            await db.collection('registrations').doc(firebaseUid).update({
                videoReady: true,
                videoUrl: videoUrl
            });
            
            res.json({ success: true });
        } catch (error) {
            console.error('Video ready error:', error);
            res.status(500).json({ error: error.message });
        }
    });
});

// Generate signed URL for video streaming
exports.getVideoUrl = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Login required');
    }
    
    const userId = context.auth.uid;
    
    try {
        const doc = await db.collection('videos').doc(userId).get();
        if (!doc.exists) {
            throw new functions.https.HttpsError('not-found', 'Video not found');
        }
        
        const videoData = doc.data();
        
        // Generate signed URL valid for 1 hour
        const bucket = storage.bucket();
        const file = bucket.file(`videos/${userId}/sample.mp4`);
        
        const [url] = await file.getSignedUrl({
            action: 'read',
            expires: Date.now() + 60 * 60 * 1000 // 1 hour
        });
        
        return { downloadUrl: url };
        
    } catch (error) {
        console.error('Get video error:', error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});

function formatIssueBody(data) {
    return `---
name: New Client Registration
user_id: ${data.user_id}
user_email: ${data.user_email || 'N/A'}
user_phone: ${data.user_phone || 'N/A'}
facebook_page: ${data.facebook_page}
submitted_at: ${data.submitted_at}
---

| Field | Value |
|-------|-------|
| **Brand Name** | ${data.brand_name} |
| **Local Name** | ${data.local_name || 'N/A'} |
| **Industry** | ${data.industry} |
| **Facebook Page** | ${data.facebook_page} |
| **Phone** | ${data.phone} |
| **Primary Color** | ${data.primary_color} |
| **Secondary Color** | ${data.secondary_color} |
| **Target Audience** | ${data.target_audience || 'N/A'} |
| **Key Offerings** | ${data.key_offerings || 'N/A'} |

### User Authentication
- **Firebase UID**: ${data.user_id}
- **Email**: ${data.user_email || 'N/A'}
- **Phone**: ${data.user_phone || 'N/A'}

### Raw Data (JSON)
\`\`\`json
${JSON.stringify(data, null, 2)}
\`\`\``;
}
