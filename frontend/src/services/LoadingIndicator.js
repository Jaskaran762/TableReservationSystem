import React from 'react';
import {Blocks} from 'react-loader-spinner';

const LoadingIndicator = () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Blocks
            visible={true}
            height="80"
            width="80"
            ariaLabel="blocks-loading"
            wrapperStyle={{}}
            wrapperClass="blocks-wrapper"
        />
    </div>
);

export default LoadingIndicator;
