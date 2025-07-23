export default function  EmilConfirmation(){


    return (
        <div className="min-h-screen w-full bg-gray-200 text-black dark:bg-gray-800 dark:text-white transition-colors flex items-center justify-center">
            <div className="text-center space-y-5">
                <p className="mt-1 text-4xl font-extrabold text-black-900 dark:text-white-100 sm:text-5xl sm:tracking-tight lg:text-6xl">
                    Your account is now
                    <span className="px-2 py-1 relative inline-block">
                        <svg className="stroke-current bottom-0 absolute text-green-500 -translate-x-2" viewBox="0 0 410 18" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6 6.4c16.8 16.8 380.8-11.2 397.6 5.602" strokeWidth="12" fill="none" fillRule="evenodd" strokeLinecap="round"></path>
                        </svg>
                        <span className="relative">verified</span>
                    </span>
                </p>
                <p className="max-w-3xl mt-5 mx-auto text-xl text-black-500 dark:text-white-300">
                    Take the leap and unleash your capabilities. Experience one week of unlimited access on us and witness the transformation.
                </p>
                <p className="max-w-3xl mt-5 mx-auto text-xl text-black-500 dark:text-white-300">
                    You can now close this window.
                </p>
            </div>
        </div>
    );
}

