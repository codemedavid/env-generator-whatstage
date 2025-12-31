'use client';

import { useState, useEffect } from 'react';

type WizardData = {
  businessName: string;
  nvidiaKey: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceKey: string;
  fbAppId: string;
  fbAppSecret: string;
  fbVerifyToken: string;
  cloudName: string;
  cloudApiKey: string;
  cloudApiSecret: string;
  cronSecret: string;
};

const STEPS = [
  { id: 'identity', title: 'Identity', description: 'Name your new creation' },
  { id: 'database', title: 'Database', description: 'Connect the knowledge base' },
  { id: 'social', title: 'Social', description: 'Establish communications' },
  { id: 'media', title: 'Media', description: 'Configure visual assets' },
  { id: 'ai', title: 'AI Power', description: 'Unlock the NVIDIA engine' },
  { id: 'complete', title: 'Complete', description: 'Collect your loot' },
];

export default function EnvWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<WizardData>({
    businessName: '',
    nvidiaKey: '',
    supabaseUrl: '',
    supabaseAnonKey: '',
    supabaseServiceKey: '',
    fbAppId: '',
    fbAppSecret: '',
    fbVerifyToken: 'TEST_TOKEN', // Default as requested, can be random
    cloudName: 'dbdq5vhpx',
    cloudApiKey: '837136723796159',
    cloudApiSecret: 'hqfzArMZpciV0arHlqrcNPDC9jA',
    cronSecret: 'YOUR_CRON_SECRET', // Default placeholder, will generate random in useEffect or on click
  });
  const [copied, setCopied] = useState(false);

  const slugify = (text: string) => {
    return text
      .toString()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  };

  const generatedBaseUrl = `https://${slugify(data.businessName)}-whatstage.vercel.app`;

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const generateEnvFile = () => {
    return `NVIDIA_API_KEY=${data.nvidiaKey}
NEXT_PUBLIC_SUPABASE_URL=${data.supabaseUrl}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${data.supabaseAnonKey}
SUPABASE_SERVICE_ROLE_KEY=${data.supabaseServiceKey}
NEXT_PUBLIC_BASE_URL=${generatedBaseUrl}
FACEBOOK_APP_ID=${data.fbAppId}
FACEBOOK_APP_SECRET=${data.fbAppSecret}
    FACEBOOK_VERIFY_TOKEN=${data.fbVerifyToken}
    CLOUDINARY_CLOUD_NAME=${data.cloudName}
    CLOUDINARY_API_KEY=${data.cloudApiKey}
    CLOUDINARY_API_SECRET=${data.cloudApiSecret}
    CRON_SECRET=${data.cronSecret}`;
  };

  const generateSql = () => {
    return `-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Cron job for execute-workflows (every minute)
SELECT cron.schedule(
  'execute-scheduled-workflows',
  '* * * * *',
  $$
  SELECT net.http_get(
    url := '${generatedBaseUrl}/api/cron/execute-workflows',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ${data.cronSecret}'
    )
  );
  $$
);

-- Cron job for follow-up-inactive-leads (every 5 minutes)
SELECT cron.schedule(
  'follow-up-inactive-leads',
  '*/5 * * * *',
  $$
  SELECT net.http_get(
    url := '${generatedBaseUrl}/api/cron/follow-up-inactive',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ${data.cronSecret}'
    )
  );
  $$
);`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateEnvFile());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="container">
      <h1>ENV Generator Protocol</h1>

      <div className="card">
        {/* Progress System */}
        <div className="step-indicator">
          <span>Current objective: {STEPS[currentStep].title}</span>
          <span>Step {currentStep + 1} / {STEPS.length}</span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
          />
        </div>

        {/* Step Content */}
        <div className="animate-fade-in">
          {currentStep === 0 && (
            <div>
              <h3>Project Identity</h3>
              <p style={{ color: 'var(--muted-foreground)', marginBottom: '1.5rem' }}>
                Enter the name of the business or project. This will automatically generate the base URL.
              </p>
              <label>Business Name</label>
              <input
                name="businessName"
                placeholder="e.g. Galaxy Coffee"
                value={data.businessName}
                onChange={handleChange}
                autoFocus
              />
              <div style={{ fontSize: '0.875rem', color: 'var(--primary)', marginBottom: '1rem' }}>
                Preview Base URL: {data.businessName ? generatedBaseUrl : '...'}
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div>
              <h3>Supabase Connection</h3>
              <p style={{ color: 'var(--muted-foreground)', marginBottom: '1.5rem' }}>
                Retrieve these keys from your Supabase project settings.
              </p>
              <label>Project URL</label>
              <input
                name="supabaseUrl"
                placeholder="https://xyz.supabase.co"
                value={data.supabaseUrl}
                onChange={handleChange}
              />
              <label>Anon Key (Public)</label>
              <input
                name="supabaseAnonKey"
                placeholder="eyJh..."
                value={data.supabaseAnonKey}
                onChange={handleChange}
              />
              <label>Service Role Key (Secret)</label>
              <input
                name="supabaseServiceKey"
                placeholder="eyJh..."
                type="password"
                value={data.supabaseServiceKey}
                onChange={handleChange}
              />
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h3>Social Communication</h3>
              <p style={{ color: 'var(--muted-foreground)', marginBottom: '1.5rem' }}>
                Configure the Facebook App settings for messaging integration.
              </p>
              <label>App ID</label>
              <input
                name="fbAppId"
                placeholder="123456789"
                value={data.fbAppId}
                onChange={handleChange}
              />
              <label>App Secret</label>
              <input
                name="fbAppSecret"
                placeholder="XxXxXxXx"
                type="password"
                value={data.fbAppSecret}
                onChange={handleChange}
              />
              <label>Verify Token</label>
              <input
                name="fbVerifyToken"
                value={data.fbVerifyToken}
                onChange={handleChange}
              />
              <button
                type="button"
                onClick={() => setData(prev => ({ ...prev, fbVerifyToken: crypto.randomUUID() }))}
                className="btn-secondary"
                style={{ width: 'auto', display: 'inline-block', fontSize: '0.8rem', padding: '0.5rem 1rem', marginTop: '-1rem', marginBottom: '1.5rem' }}
              >
                Generate Random Token
              </button>

              <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem' }}>
                <h4 style={{ marginTop: 0, marginBottom: '1rem' }}>Configuration URLs</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', marginBottom: '1rem' }}>
                  Copy these URLs to your Facebook App settings.
                </p>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ fontSize: '0.75rem' }}>Webhook URL</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      readOnly
                      value={data.businessName ? `${generatedBaseUrl}/api/webhook` : 'Enter Business Name first'}
                      style={{ marginBottom: 0, fontSize: '0.8rem' }}
                    />
                    <button
                      className="btn-secondary"
                      onClick={() => navigator.clipboard.writeText(`${generatedBaseUrl}/api/webhook`)}
                      disabled={!data.businessName}
                      style={{ padding: '0 1rem' }}
                    >
                      Copy
                    </button>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem' }}>OAuth Callback URL</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      readOnly
                      value={data.businessName ? `${generatedBaseUrl}/api/auth/facebook/callback` : 'Enter Business Name first'}
                      style={{ marginBottom: 0, fontSize: '0.8rem' }}
                    />
                    <button
                      className="btn-secondary"
                      onClick={() => navigator.clipboard.writeText(`${generatedBaseUrl}/api/auth/facebook/callback`)}
                      disabled={!data.businessName}
                      style={{ padding: '0 1rem' }}
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <div style={{ marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
                  <label style={{ fontSize: '0.75rem', marginBottom: '0.5rem', display: 'block' }}>Privacy Policy & Terms (Use Project URL)</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      readOnly
                      value={data.businessName ? generatedBaseUrl : 'Enter Business Name first'}
                      style={{ marginBottom: 0, fontSize: '0.8rem' }}
                    />
                    <button
                      className="btn-secondary"
                      onClick={() => navigator.clipboard.writeText(generatedBaseUrl)}
                      disabled={!data.businessName}
                      style={{ padding: '0 1rem' }}
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <h3>Media Assets</h3>
              <p style={{ color: 'var(--muted-foreground)', marginBottom: '1.5rem' }}>
                Cloudinary configuration. Defaults are provided but can be overridden.
              </p>
              <label>Cloud Name</label>
              <input
                name="cloudName"
                value={data.cloudName}
                onChange={handleChange}
              />
              <label>API Key</label>
              <input
                name="cloudApiKey"
                value={data.cloudApiKey}
                onChange={handleChange}
              />
              <label>API Secret</label>
              <input
                name="cloudApiSecret"
                type="password"
                value={data.cloudApiSecret}
                onChange={handleChange}
              />
            </div>
          )}

          {currentStep === 4 && (
            <div>
              <h3>AI Engine</h3>
              <p style={{ color: 'var(--muted-foreground)', marginBottom: '1.5rem' }}>
                Input the NVIDIA API Key to power the intelligence.
              </p>
              <label>NVIDIA API Key</label>
              <input
                name="nvidiaKey"
                placeholder="nvapi-..."
                value={data.nvidiaKey}
                onChange={handleChange}
              />
            </div>
          )}

          {currentStep === 5 && (
            <div style={{ textAlign: 'center' }}>
              <h3>Mission Accomplished</h3>

              {/* Project Name Section */}
              <div style={{ marginBottom: '2rem', textAlign: 'left', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '0.5rem' }}>
                <label style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Project Name</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input readOnly value={`${slugify(data.businessName)}-whatstage`} style={{ marginBottom: 0 }} />
                  <button
                    className="btn-secondary"
                    onClick={() => navigator.clipboard.writeText(`${slugify(data.businessName)}-whatstage`)}
                    style={{ padding: '0 1.5rem' }}
                  >
                    Copy
                  </button>
                </div>
              </div>

              <p style={{ color: 'var(--muted-foreground)', marginBottom: '1rem', textAlign: 'left' }}>
                Your configuration is ready. Copy into your .env file.
              </p>

              <div className="code-block" style={{ textAlign: 'left' }}>
                {generateEnvFile()}
              </div>

              <button className="btn-primary" onClick={copyToClipboard} style={{ marginBottom: '2rem' }}>
                {copied ? 'Copied to Clipboard!' : 'Copy .env to Clipboard'}
              </button>

              {/* Final Details Section */}
              <div style={{ textAlign: 'left', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '0.5rem' }}>
                <h4 style={{ marginTop: 0 }}>Webhook & Token</h4>

                <div style={{ marginBottom: '1rem' }}>
                  <label>Webhook URL (for Facebook)</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input readOnly value={`${generatedBaseUrl}/api/webhook`} style={{ marginBottom: 0 }} />
                    <button
                      className="btn-secondary"
                      onClick={() => navigator.clipboard.writeText(`${generatedBaseUrl}/api/webhook`)}
                      style={{ padding: '0 1rem' }}
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <div>
                  <label>Verify Token</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input readOnly value={data.fbVerifyToken} style={{ marginBottom: 0 }} />
                    <button
                      className="btn-secondary"
                      onClick={() => navigator.clipboard.writeText(data.fbVerifyToken)}
                      style={{ padding: '0 1rem' }}
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>

              {/* Supabase Cron SQL Section */}
              <div style={{ textAlign: 'left', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '0.5rem', marginTop: '2rem' }}>
                <h4 style={{ marginTop: 0 }}>Supabase Cron SQL</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', marginBottom: '1rem' }}>
                  Run this in your Supabase SQL Editor.
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <label style={{ marginBottom: 0 }}>Cron Secret</label>
                  <button
                    className="btn-secondary"
                    onClick={() => setData(prev => ({ ...prev, cronSecret: crypto.randomUUID() }))}
                    style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                  >
                    Generate New Secret
                  </button>
                </div>
                <input
                  readOnly
                  value={data.cronSecret}
                  style={{ marginBottom: '1.5rem', fontFamily: 'monospace' }}
                />

                <div className="code-block" style={{ marginBottom: '1rem' }}>
                  {generateSql()}
                </div>
                <button
                  className="btn-secondary"
                  onClick={() => navigator.clipboard.writeText(generateSql())}
                  style={{ width: '100%' }}
                >
                  Copy SQL to Clipboard
                </button>
              </div>

            </div>
          )}
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
          {currentStep > 0 && currentStep < 5 && (
            <button className="btn-secondary" onClick={handleBack}>
              Back
            </button>
          )}
          {currentStep === 0 && <div />} {/* Spacer */}

          {currentStep < 5 && (
            <button className="btn-primary" onClick={handleNext} style={{ width: 'auto' }}>
              Next Step
            </button>
          )}
          {currentStep === 5 && (
            <button className="btn-secondary" onClick={() => setCurrentStep(0)}>
              Start Over
            </button>
          )}
        </div>
      </div >
    </main >
  );
}
