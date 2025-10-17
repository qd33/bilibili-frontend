export const logEnvironment = () => {
  console.log('=== 环境变量信息 ===');
  console.log('MODE:', import.meta.env.MODE);
  console.log('DEV:', import.meta.env.DEV);
  console.log('PROD:', import.meta.env.PROD);
  console.log('VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
  console.log('VITE_APP_TITLE:', import.meta.env.VITE_APP_TITLE);
  console.log('==================');
};
