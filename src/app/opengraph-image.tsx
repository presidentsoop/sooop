import { ImageResponse } from 'next/og';
import { join } from 'path';
import { readFileSync } from 'fs';

export const alt = 'SOOOP - Society of Optometrists Pakistan';
export const size = {
    width: 1200,
    height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
    // Read the logo file from the public directory
    const logoData = readFileSync(join(process.cwd(), 'public', 'logo.jpg'));
    const logoSrc = `data:image/jpeg;base64,${logoData.toString('base64')}`;

    return new ImageResponse(
        (
            <div
                style={{
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(to bottom right, #0B1120, #0f172a)',
                    color: 'white',
                    fontFamily: 'sans-serif',
                    position: 'relative',
                }}
            >
                {/* Abstract Background Shapes */}
                <div
                    style={{
                        position: 'absolute',
                        top: '-20%',
                        left: '10%',
                        width: '600px',
                        height: '600px',
                        background: 'rgba(56, 189, 248, 0.1)',
                        borderRadius: '50%',
                        filter: 'blur(100px)',
                    }}
                />
                <div
                    style={{
                        position: 'absolute',
                        bottom: '-10%',
                        right: '10%',
                        width: '500px',
                        height: '500px',
                        background: 'rgba(99, 102, 241, 0.1)',
                        borderRadius: '50%',
                        filter: 'blur(100px)',
                    }}
                />

                {/* Main Content */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '32px', zIndex: 10 }}>
                    {/* Real Logo */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '240px',
                            height: '240px',
                            borderRadius: '30px',
                            background: 'white',
                            boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                            overflow: 'hidden',
                            border: '4px solid rgba(255,255,255,0.1)'
                        }}
                    >
                        <img src={logoSrc} width="240" height="240" style={{ objectFit: 'cover' }} />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ fontSize: '90px', fontWeight: 'bold', letterSpacing: '-0.02em', background: 'linear-gradient(to right, #ffffff, #94a3b8)', backgroundClip: 'text', color: 'transparent' }}>
                            SOOOP
                        </div>
                        <div style={{ fontSize: '36px', color: '#94a3b8', marginTop: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            Society of Optometrists Pakistan
                        </div>
                    </div>
                </div>

                <div
                    style={{
                        position: 'absolute',
                        bottom: '60px',
                        fontSize: '24px',
                        color: '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}
                >
                    <div style={{ width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%' }}></div>
                    Advancing Eye Care Excellence
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}
