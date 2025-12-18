import {Modal, TitleBar, useAppBridge} from '@shopify/app-bridge-react';

import './customizer-setting.css';
import {CustomizerOptions} from './customizer-options'

export function CustomizerModal() {
    const shopify = useAppBridge();

    return (
        <>
            <s-button variant="primary" onClick={() => shopify.modal.show("my-modal")}>
                Open customizer edit
            </s-button>
            <Modal id="my-modal" variant="max">
                <div className="rtbp-full-modal-editor">
                    <div className="rtbp-full-content">
                        <div className="rtbp-left-setting">
                            <CustomizerOptions/>
                        </div>
                        <div className="rtbp-right-review">Right</div>
                    </div>
                </div>
                <TitleBar title="Live Design Customizer">
                    <button variant="primary">Save</button>
                    <button onClick={() => shopify.modal.hide('my-modal')}>Discard</button>
                </TitleBar>
            </Modal>


            <>
                <s-button commandFor="modal">Open</s-button>

                <s-modal id="modal" heading="Details">
                    <CustomizerOptions/>

                    <s-button slot="secondary-actions" commandFor="modal" command="--hide">
                        Close
                    </s-button>
                    <s-button
                        slot="primary-action"
                        variant="primary"
                        commandFor="modal"
                        command="--hide"
                    >
                        Save
                    </s-button>
                </s-modal>
            </>
        </>
    );
}