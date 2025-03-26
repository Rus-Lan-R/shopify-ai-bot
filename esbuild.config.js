import esbuild from "esbuild";
import cssModulesPlugin from "esbuild-plugin-css-modules";

esbuild
  .build({
    entryPoints: ["./embeded/chat.tsx"], // Ваша точка входа
    bundle: true, // Объединяем все зависимости в один файл
    outfile: "./public/embeded/chat.js", // Путь к выходному файлу
    format: "iife", // Формат, подходящий для использования в браузере
    globalName: "RemixEmbed", // Глобальная переменная для вашего компонента
    // jsx: "react-jsx", // Поддержка JSX
    sourcemap: false, // Генерация карты исходников (опционально)
    loader: {
      ".css": "css", // Загрузка CSS файлов
    },
    plugins: [
      cssModulesPlugin(), // Добавляем плагин для работы с CSS модулями
    ],
  })
  .catch((error) => {
    console.log(error);
    return process.exit(1);
  });
