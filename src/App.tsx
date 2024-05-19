import React from "react";
import WebSocketProvider from "./provider/WebSocketProvider";
import Dashboard from "./components/Dashboard";

const App: React.FC = () => {
    return (
        <WebSocketProvider>
            <div className="flex justify-center">
                <Dashboard />
            </div>
        </WebSocketProvider>
    );
};

export default App;
