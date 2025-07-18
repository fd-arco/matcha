export default function mailModal({ onClose }){


    return (
            <div className="fixed z-10 inset-0 overflow-y-auto" id="my-email-modal">
                <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                    <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                        <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                    </div>
                    <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                    <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
                        role="dialog" aria-modal="true" aria-labelledby="modal-headline">
                        <div>
                            <div className="mt-3 text-center sm:mt-5">
                                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-headline">
                                    Error
                                </h3>
                                <div className="mt-2">
                                    <p className="text-sm text-gray-500">
                                        email already in use!
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-5 sm:mt-6">
                            <button
                                className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#679267] text-base font-medium text-white hover:bg-[#4E754E] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:bg-[#4E754E] sm:text-sm"
                                onClick={onClose}>
                                OK
                            </button>
                        </div>
                    </div>
                </div>
        </div>
    );
}