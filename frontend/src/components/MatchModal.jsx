import React from "react";
import {motion, AnimatePresence} from "framer-motion";

const MatchModal = ({name, photo, onClose}) => {

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
                initial={{opacity:0}}
                animate={{opacity:1}}
                exit={{opacity:0}}
            >
                <motion.div
                    className="bg-white rounded-2xl shadow-xl p-6 w-80 text-center relative"
                    initial={{scale:0.8, opacity:0}}
                    animate={{scale:1, opacity:1}}
                    exit={{scale:0.8, opacity:0}}
                    transition={{type:"spring", stiffness:300, damping:20}}
                >
                    <h2 className="text-2xl font-bold text-green-600 mb-2">💚 It's a Match!</h2>
                    <p className="text-gray-700 mb-4">You matched with <span className="font-semibold">{name}</span> !</p>
                    {photo && (
                        <img
                            src={`http://localhost:3000${photo}`}
                            alt={name}
                            className="w-24 h-24 rounded-full object-cover mx-auto border-4 border-green-500"
                        />
                    )}
                    <button
                        onClick={onClose}
                        className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                    >
                        Close
                    </button>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}

export default MatchModal;