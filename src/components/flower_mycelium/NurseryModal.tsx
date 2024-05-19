import React, { FC, ReactElement, useState, useRef } from "react";
import { useWebSocket } from "../../provider/WebSocketProvider";
import * as Dialog from "@radix-ui/react-dialog";

import { Flower } from "../../interfaces/interfaces";
import { FlowerCardProps } from "./FlowerCard";
import InputField from "../common/InputField";

interface NurseryModalProps {
    key?: string;
    flowerCard: ReactElement<FlowerCardProps>;
    updateFlower: (flowerParams: Flower) => void;
}

const NurseryModal: FC<NurseryModalProps> = ({
    key,
    flowerCard,
    updateFlower,
}) => {
    const flowerParams: Flower | undefined = flowerCard.props.flowerParams;

    const [deviceName, setDeviceName] = useState(
        flowerParams ? flowerParams.name : "",
    );
    const [deviceDescription, setDeviceDescription] = useState(
        flowerParams ? flowerParams.description : "",
    );
    const [ipAddress, setIpAddress] = useState(
        flowerParams ? flowerParams.ip : "",
    );
    const [port, setPort] = useState(
        flowerParams ? flowerParams.port.toString() : "81",
    );
    const websocketContext = useWebSocket();
    const closeRef: React.MutableRefObject<HTMLButtonElement | null> =
        useRef(null);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const portNumber = parseInt(port, 10);
        const deviceId = flowerCard.props.id;
        if (websocketContext && deviceId && ipAddress && port) {
            websocketContext.addDevice({
                id: deviceId,
                ip: ipAddress,
                port: portNumber,
            });
            updateFlower({
                id: deviceId,
                name: deviceName,
                description: deviceDescription,
                ip: ipAddress,
                port: portNumber,
            });
            handleClose();
        }
    };

    const handleClose = () => {
        setDeviceName("");
        setDeviceDescription("");
        setIpAddress("");
        setPort("81");
        closeRef?.current?.click && closeRef.current.click();
    };

    return (
        <>
            <Dialog.Root key={key}>
                <Dialog.Trigger asChild>{flowerCard}</Dialog.Trigger>
                <Dialog.Overlay className="fixed inset-0 bg-const-black bg-opacity-50 z-40" />
                <Dialog.Portal>
                    <Dialog.Content
                        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-pol-bg-1 p-6 rounded-lg w-300 max-w-md z-50"
                        onInteractOutside={(event) => event.preventDefault()}
                    >
                        <Dialog.Title className="text-lg font-bold text-pol-ultra-red">
                            Connect to Device
                        </Dialog.Title>
                        <Dialog.Close ref={closeRef} className="hidden" />
                        <form
                            onSubmit={handleSubmit}
                            className="space-y-4 pt-5"
                        >
                            <InputField
                                label="Device Name"
                                placeholder="Enter Device Name"
                                value={deviceName}
                                setValue={setDeviceName}
                                type="text"
                            />
                            <InputField
                                label="Device Description"
                                placeholder="Enter Device Description"
                                value={deviceDescription}
                                setValue={setDeviceDescription}
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
                                <button
                                    type="submit"
                                    className="bg-pol-ultra-red text-pol-text-2 px-4 py-2 rounded hover:bg-red-600"
                                >
                                    Connect
                                </button>
                            </div>
                        </form>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </>
    );
};

export default NurseryModal;
