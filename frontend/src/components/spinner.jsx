export default function Spinner(){

    return (
        <div class="transition-colors duration-300">
            <div class="min-h-screen p-8" id="main-container">
                <div class="max-w-4xl mx-auto">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div class="spinner-card bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg flex flex-col items-center space-y-4">
                            <h2 class="font-semibold text-lg dark:text-white">Circle Spinner</h2>
                            <div class="border-4 border-blue-500 dark:border-blue-400 rounded-full w-12 h-12 spinner-circle"></div>
                            <button class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
                                email verification...
                            </button>
                        </div>
                    </div>
                </div>
            </div>
    </div>
    );
}