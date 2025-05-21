import React from "react";
import {motion, AnimatePresence} from "framer-motion";

const MatchModal = ({name, photo, onClose}) => {

    return (
        <AnimatePresence>
            <motion.div
                className="text-black dark:text-white fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
                initial={{opacity:0}}
                animate={{opacity:1}}
                exit={{opacity:0}}
            >
                <motion.div
                    className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 w-80 text-center relative"
                    initial={{scale:0.8, opacity:0}}
                    animate={{scale:1, opacity:1}}
                    exit={{scale:0.8, opacity:0}}
                    transition={{type:"spring", stiffness:300, damping:20}}
                >
                    <h2 className="text-2xl font-bold text-green-500 dark:text-green-800 mb-2">💚 It's a Match!</h2>
                    <p className="mb-4">You matched with <span className="font-semibold">{name}</span> !</p>
                    {photo && (
                        <img
                            src={`http://localhost:3000${photo}`}
                            alt={name}
                            className="w-24 h-24 rounded-full object-cover mx-auto border-4 border-green-500 dark:border-green-800"
                        />
                    )}
                    <button
                        onClick={onClose}
                        className="mt-4 px-4 py-2 bg-green-500 rounded-lg hover:bg-green-400 dark:bg-green-800 dark:hover:bg-green-900 transition"
                    >
                        Close
                    </button>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}

export default MatchModal;