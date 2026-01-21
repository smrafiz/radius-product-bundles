import { ROUTES } from "@/shared";

export function CustomizerModal() {
    return (
        <div>
            <s-app-window
                id="rtpb-window"
                src={ROUTES.CUSTOMIZER}
            ></s-app-window>
            <s-button
                variant="primary"
                command="--show"
                commandFor="rtpb-window"
            >
                Open style customizer
            </s-button>
        </div>
    );
}
