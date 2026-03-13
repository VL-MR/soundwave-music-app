export function Spacer() {
    return (
        <div style={{backgroundColor: 'black'}} >
            <div style={{
                backgroundColor: 'black',
                padding: '10px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                color: 'white',
                //marginLeft: '300px'
            }}>
                <p style={{ margin: '0', fontWeight: 'normal' }}>© 2024 SoundWave</p>
                <p style={{ margin: '0', fontWeight: 'normal' }}>All rights reserved</p>
                <p style={{ margin: '0', fontWeight: 'normal' }}>Privacy Policy | Terms of Use</p>
            </div>
            <div style={{
                backgroundColor: 'black',
                height: '145px',
                width: '100%',
            }} />
        </div>
    );
}
