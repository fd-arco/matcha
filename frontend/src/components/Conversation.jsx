import React, {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";

const Conversation = ({match, onBack}) => {
    return (
        <div className="bg-gray-100 dark:bg-gray-700 flex flex-col items-center justify-center h-full p-4 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Conversation incoming....</h2>
            <button
                onClick={onBack}
                className="mt-4 px-6 py-2 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600"
            >
                🔙 Back to Swipes
            </button>
        </div>
    )
};

export default Conversation;