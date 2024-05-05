import React, { FC, ReactElement, useState, Fragment } from "react";
import { useWebSocket } from "../../provider/WebSocketProvider";
import * as Dialog from "@radix-ui/react-dialog";

import InputField from "../common/InputField";

interface NurseryModalProps {
    flowerCard: ReactElement<any, any>;
}

const NurseryModal: FC<NurseryModalProps> = ({flowerCard}) => {
    const [deviceId, setDeviceId] = useState("");
    const [ipAddress, setIpAddress] = useState("");
    const [port, setPort] = useState("81");
    const websocketContext = useWebSocket();

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const portNumber = parseInt(port, 10);
        if (websocketContext && deviceId && ipAddress && portNumber) {
            websocketContext.addDevice({ id: deviceId, ip: ipAddress, port: portNumber });
        }
    };

    return (<>
        <Dialog.Root>
            <Dialog.Trigger asChild>{flowerCard}</Dialog.Trigger>
            <Dialog.Overlay className="fixed inset-0 bg-const-black bg-opacity-50 z-40" />
            <Dialog.Portal>
                <Dialog.Content
                    className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-pol-bg-1 p-6 rounded-lg w-300 max-w-md z-50"
                    onInteractOutside={(event) => event.preventDefault()}>
                    <Dialog.Title className="text-lg font-bold text-pol-ultra-red">Connect to Device</Dialog.Title>
                    <form onSubmit={handleSubmit} className="space-y-4 pt-5">
                        <InputField
                            label="Device ID"
                            placeholder="Enter device ID"
                            value={deviceId}
                            setValue={setDeviceId}
                            type="text"
                        />
                        <InputField
                            label="IP Address"
                            placeholder="Enter IP address"
                            value={ipAddress}
                            setValue={setIpAddress}
                            type="text"
                        />
                        <InputField
                            label="Port"
                            placeholder="Enter port"
                            value={port}
                            setValue={setPort}
                            type="number"
                        />
                        <div className="flex justify-end space-x-3 mt-4">
                            <Dialog.Close asChild>
                                <button className="text-pol-text-1 px-4 py-2 rounded hover:bg-gray-600">
                                    Cancel
                                </button>
                            </Dialog.Close>
                            <button type="submit" className="bg-pol-ultra-red text-pol-text-2 px-4 py-2 rounded hover:bg-red-600">
                                Connect
                            </button>
                        </div>
                    </form>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    </>);
};

export default NurseryModal;
