<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Success - Maseer Media</title>
    
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Noto+Naskh+Arabic:wght@400;600;700&family=Noto+Sans+Arabic:wght@400;600;700&display=swap" rel="stylesheet">
    
    <style>
        :root {
            --maseer-purple: #6B21A8;
            --maseer-gold: #EAB308;
            --maseer-dark: #0A0A0F;
            --success: #10B981;
        }
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: 'Inter', 'Noto Naskh Arabic', sans-serif;
            background: var(--maseer-dark);
            color: #ffffff;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
        }
        
        .success-card {
            background: linear-gradient(145deg, rgba(26, 26, 46, 0.95), rgba(18, 18, 26, 0.98));
            border: 1px solid rgba(16, 185, 129, 0.3);
            border-radius: 2rem;
            padding: 3rem;
            max-width: 700px;
            width: 100%;
            text-align: center;
        }
        
        .checkmark {
            width: 100px;
            height: 100px;
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.05));
            border: 3px solid var(--success);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 2rem;
            font-size: 3.5rem;
            animation: checkPulse 2s ease-in-out infinite;
        }
        
        @keyframes checkPulse {
            0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
            50% { box-shadow: 0 0 0 20px rgba(16, 185, 129, 0); }
        }
        
        h1 { font-size: 2rem; margin-bottom: 1rem; font-weight: 700; }
        
        .brand-name { color: var(--maseer-gold); font-weight: 800; }
        
        .subtitle { color: rgba(255,255,255,0.6); font-size: 1.125rem; margin-bottom: 2rem; line-height: 1.7; }
        
        .steps {
            background: rgba(0,0,0,0.3);
            border-radius: 1rem;
            padding: 1.5rem;
            margin: 2rem 0;
            text-align: left;
        }
        
        .step {
            display: flex;
            align-items: flex-start;
            gap: 1rem;
            margin-bottom: 1rem;
            padding: 1rem;
            background: rgba(255,255,255,0.05);
            border-radius: 0.75rem;
        }
        
        .step:last-child { margin-bottom: 0; }
        
        .step-number {
            width: 32px;
            height: 32px;
            background: var(--maseer-purple);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            flex-shrink: 0;
        }
        
        .step-content h3 { font-size: 1rem; margin-bottom: 0.25rem; color: #fff; }
        .step-content p { font-size: 0.875rem; color: rgba(255,255,255,0.6); }
        
        .btn {
            display: inline-flex;
            align-items: center;
            gap: 0.75rem;
            background: linear-gradient(135deg, var(--maseer-purple), #4C1D95);
            color: white;
            text-decoration: none;
            padding: 1rem 2rem;
            border-radius: 0.75rem;
            font-weight: 600;
            margin-top: 1.5rem;
            transition: all 0.3s;
            border: none;
            cursor: pointer;
        }
        
        .btn:hover { transform: translateY(-2px); box-shadow: 0 15px 30px rgba(107, 33, 168, 0.4); }
        
        .note {
            background: rgba(234, 179, 8, 0.1);
            border: 1px solid rgba(234, 179, 8, 0.3);
            border-radius: 0.75rem;
            padding: 1rem;
            margin-top: 1.5rem;
            font-size: 0.875rem;
            color: #EAB308;
        }
    </style>
</head>
<body>
    <div class="success-card">
        <div class="checkmark">✓</div>
        
        <h1>You're Almost Done!</h1>
        
        <p class="subtitle">
            Complete these final steps to get your sample video.
        </p>
        
        <div class="steps">
            <div class="step">
                <div class="step-number">1</div>
                <div class="step-content">
                    <h3>Review on GitHub</h3>
                    <p>Check your pre-filled data and click "Create issue"</p>
                </div>
            </div>
            <div class="step">
                <div class="step-number">2</div>
                <div class="step-content">
                    <h3>Attach Your Logo</h3>
                    <p>Reply to the created issue with your logo image</p>
                </div>
            </div>
            <div class="step">
                <div class="step-number">3</div>
                <div class="step-content">
                    <h3>Get Your Video</h3>
                    <p>Sample will be ready in ~3 minutes on Telegram</p>
                </div>
            </div>
        </div>
        
        <div class="note">
            ⚠️ <strong>Important:</strong> If you haven't created the GitHub issue yet, 
            <a href="index.html" style="color: #EAB308;">go back</a> and click "Continue to GitHub"
        </div>
        
        <a href="index.html" class="btn">← Register Another Brand</a>
    </div>
</body>
</html>
