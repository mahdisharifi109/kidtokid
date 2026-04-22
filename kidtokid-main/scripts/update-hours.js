const fs = require('fs');

const aboutPath = 'src/pages/AboutPage.tsx';
let about = fs.readFileSync(aboutPath, 'utf-8');

about = about.replace(/<p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1\.5">HorÃ¡rio<\/p>[\s\S]*?hora antes do fecho\.\s*<\/p>/, \
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Horário</p>
                    <div className={\inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium w-fit \\}>
                      <span className={\w-1.5 h-1.5 rounded-full mr-1.5 \\}></span>
                      {isOpen ? "Aberto Agora" : "Fechado Agora"}
                    </div>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between gap-4">
                      <span className="text-gray-500 dark:text-gray-400">Segunda a Sexta</span>
                      <span className="text-gray-700 dark:text-gray-300">{settings.weekdayHours}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-gray-500 dark:text-gray-400">Sábado</span>
                      <span className="text-gray-700 dark:text-gray-300">{settings.saturdayHours}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-gray-500 dark:text-gray-400">Domingo</span>
                      <span className={settings.sundayHours.toLowerCase().includes("fechado") ? "text-red-500" : "text-gray-700 dark:text-gray-300"}>{settings.sundayHours}</span>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                    Compras de artigos aceites até uma hora antes do fecho.
                  </p>
                  \);

fs.writeFileSync(aboutPath, about);
console.log('Done AboutPage.tsx');
