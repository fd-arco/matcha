export default function mailLogModal({ onClose }){


    return (
            <div class="fixed z-10 inset-0 overflow-y-auto" id="my-email-modal">
                <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                    <div class="fixed inset-0 transition-opacity" aria-hidden="true">
                        <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
                    </div>
                    <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                    <div class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
                        role="dialog" aria-modal="true" aria-labelledby="modal-headline">
                        <div>
                            <div class="mt-3 text-center sm:mt-5">
                                <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-headline">
                                    Error
                                </h3>
                                <div class="mt-2">
                                    <p class="text-sm text-gray-500">
                                        Something is wrong with your Emailor password!
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div class="mt-5 sm:mt-6">
                            <button
                                class="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-500 hover:bg-green-400 dark:bg-green-800 dark:hover:bg-green-900 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2  sm:text-sm"
                                onClick={onClose}>
                                OK
                            </button>
                        </div>
                    </div>
                </div>
        </div>
    );
}