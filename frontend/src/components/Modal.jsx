export default function WelcomeModal(){

    return (
      <div
      className="fixed inset-0 bg-gray-800 bg-opacity-60 overflow-y-auto h-full w-full z-10"
      id="cookie-modal"
      role="dialog"
      aria-modal="true"
      >
            <div className="relative top-20 mx-auto p-4 md:p-6 border w-3/4 m-10 md:w-96 shadow-lg rounded-lg bg-white z-50">
              <div className="text-center">
              <div class="transition-colors duration-300">
             
                          <div class="spinner-card bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg flex flex-col items-center space-y-4">
                              <h2 class="font-semibold  text-lg dark:text-white">An email has been sent to verify your account</h2>
                              <div class="border-4 rounded-full w-12 h-12 spinner-circle"></div>
                          </div>
                      </div>
                <div className="mt-4 px-4 py-3">
                  <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                    With the verification of your account you may acces to more features.
                  </p>
                </div>
              </div>
            </div>
          </div>
      );
}

<div class="bg-gray-200 dark:text-white dark:bg-gray-600 min-h-[calc(100vh-72px)] flex items-center justify-center p-4"><div class="w-full max-w-[900px] bg-[#13131a] rounded-3xl overflow-hidden shadow-2xl flex flex-col lg:flex-row"><div class="w-full lg:w-1/2 relative"><div class="relative h-full"><img src="/static/media/matcha1.c3ca315457d8bdd7b1d1.jpg" alt="cup" class="w-full h-full object-cover"><div class="absolute inset-0 bg-purple-900/30"></div><div class="absolute bottom-12 left-12 dark:text-white"><h2 class="dark:text-white text-2xl md:text-4xl font-semibold mb-2 italic">find more</h2><h2 class="dark:text-white text-2xl md:text-4xl font-semibold italic">than love</h2><div class="flex gap-2 mt-6"><div class="w-4 h-1 bg-white/30 rounded"></div><div class="w-4 h-1 bg-white/30 rounded"></div><div class="w-4 h-1 bg-white rounded"></div></div></div></div></div><div class="w-full lg:w-1/2 p-6 lg:p-12 bg-gray-400 dark:bg-gray-800"><div class="max-w-md mx-auto"><h1 class="text-black dark:text-white text-2xl md:text-4xl font-semibold mb-2">Create an account</h1><br><form class="space-y-2" novalidate=""><div class="flex flex-col md:flex-row gap-4"><input type="text" required="" maxlength="50" placeholder="First name" class="w-full dark:text-white placeholder-gray-700 dark:placeholder-gray-400 md:w-1/2 bg-gray-300 dark:bg-gray-600 text-black rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-600" value="fdp"><input type="text" required="" maxlength="50" placeholder="Last name" class="w-full dark:text-white placeholder-gray-700 dark:placeholder-gray-400 md:w-1/2 bg-gray-300 dark:bg-gray-600 text-black rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-600" value="fdp"></div><input type="email" maxlength="100" placeholder="Email" class="w-full dark:text-white placeholder-gray-700 dark:placeholder-gray-400 bg-gray-300 dark:bg-gray-600 text-black rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-600" value=""><div class="relative"><input type="password" maxlength="64" placeholder="Enter your password" class="w-full dark:text-white placeholder-gray-700 dark:placeholder-gray-400 bg-gray-300 dark:bg-gray-600 text-black rounded-lg p-3 pr-10 focus:outline-none focus:ring-2 focus:ring-purple-600" value=""></div><br><button type="submit" class="w-full  bg-green-500 dark:text-white hover:bg-green-400 dark:bg-green-800 dark:hover:bg-green-900 text-black rounded-lg p-3 transition-colors">Create account</button><div class="relative my-8"><div class="absolute inset-0 flex items-center"><div class="w-full border-t border-gray-700"></div></div></div></form></div></div></div></div>