import React from "react";
import BLEProvider from "./helpers/BLEProvider";
import Dashboard from "./components/Dashboard";

const App: React.FC = () => {
    return (
        <BLEProvider>
            <div className="flex justify-center">
                <Dashboard />
            </div>
        </BLEProvider>
    );
};

export default App;
