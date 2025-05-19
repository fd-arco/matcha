import React from "react";
import {motion, AnimatePresence} from "framer-motion";

const ConfirmActionModal = ({
    isOpen,
    onClose,
    onConfirm,
    onReasonChange,
    title="Are you sure?",
    message="Do you really want to proceed?",
    confirmLabel = "Confirm",
    cancelLabel="Cancel",
    showTextarea=true,
}) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
                initial={{opacity:0}}
                animate={{opacity:1}}
                exit={{opacity:0}}
            >
                <motion.div
                    className="bg-white rounded-2xl shadow-xl p-6 w-96 text-center"
                    initial={{scale:0.8, opacity:0}}
                    animate={{scale:1, opacity:1}}
                    exit={{scale:0.8, opacity:0}}
                    transition={{type:"spring", stiffness:300, damping:20}}
                >
                    <h2 className="text-xl font-bold text-gray-800 mb-3">{title}</h2>
                    <p className="text-gray-700 mb-6">{message}</p>
                    {showTextarea && (
                        <textarea
                            onChange={(e) => onReasonChange(e.target.value)}
                            placeholder="Optional: add a reason for your action"
                            className="w-full h-24 p-2 border border-gray-300 rounded-md resize-none mb-4 text-sm"
                        />
                    )}
                    <div className="flex justify-center gap-4">
                        {cancelLabel && (
                            <button
                                onClick={onClose}
                                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
                            >
                                {cancelLabel}
                            </button>
                        )}
                        <button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className="px-4  py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                        >
                            {confirmLabel}
                        </button>
                    </div>
                </motion.div>
            </motion.div>

        </AnimatePresence>
    )
}

export default ConfirmActionModal;