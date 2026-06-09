import firebase from '@react-native-firebase/app';

// Firebase 配置
// 请在 Firebase Console (https://console.firebase.google.com/) 创建项目后填入配置
const firebaseConfig = {
  appId: 'YOUR_APP_ID',           // 从 Firebase Console -> Project Settings -> Your apps 获取
  apiKey: 'YOUR_API_KEY',         // 从 Firebase Console -> Project Settings -> Web API Key 获取
  projectId: 'YOUR_PROJECT_ID',   // 从 Firebase Console -> Project Settings 获取
  storageBucket: 'YOUR_STORAGE_BUCKET',
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
};

// 初始化 Firebase（防止重复初始化）
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export default firebase;
