// redux/features/auth/authSlice.js
import { createSlice } from '@reduxjs/toolkit';

// 1. Initial State (الحالة الأولية):
// دي القيم اللي الـ State بتاع الـ Auth هيكون عليها أول ما التطبيق يشتغل.
// بنحاول نجيب الـ Token وبيانات المستخدم من الـ localStorage أول ما الـ App يفتح.
const initialState = {
  // Access Token: ده التوكن اللي بنحطه في الـ Authorization Header لكل Request للـ API.
  // بنخزنه في localStorage عشان نقدر نوصلّه بـ JavaScript ونبعته مع كل طلب.
  // typeof window !== 'undefined' دي مهمة عشان الكود ده ميتنفذش غير في الـ Browser.
  authToken: typeof window !== 'undefined' ? localStorage.getItem('authToken') : null,

  // Refresh Token: هذا التوكن (الكوكي) لا يتم تخزينه في الـ Redux State أو الـ localStorage.
  // هو موجود فقط في الـ HTTP-only cookie الذي يتعامل معه المتصفح والـ Backend مباشرة.
  // مفيش سطر هنا للـ refreshToken خلاص.

  // بيانات المستخدم: (زي الاسم، الإيميل، الـ ID). بنخزنها عشان نعرضها في الـ UI (الـ Navbar مثلاً).
  user: typeof window !== 'undefined' && localStorage.getItem('user')
        ? JSON.parse(localStorage.getItem('user')) // بنعمل parse لو كانت محفوظة كـ JSON string
        : null,

  // isAuthenticated: Flag بنحدد بيه هل المستخدم مسجل دخول ولا لأ بناءً على وجود الـ authToken.
  isAuthenticated: typeof window !== 'undefined' ? !!localStorage.getItem('authToken') : false,

  // loading: Flag عشان نعرف لو لسه بنحمل حالة الـ Auth أول مرة (مهم عشان الـ UI ميعرضش حاجة غلط).
  loading: true,
};

// 2. إنشاء الـ Auth Slice باستخدام createSlice:
const authSlice = createSlice({
  name: 'auth', // اسم الـ Slice
  initialState, // الـ Initial State اللي عرفناه فوق
  reducers: {

    // دالة setCredentials: بتشتغل لما المستخدم يسجل دخول أو يسجل حساب جديد بنجاح.
    setCredentials: (state, action) => {
      // الـ Backend دلوقتي هيرجع لنا في الـ Response Body:
      // - 'token': ده الـ Access Token (هو اللي محتاجينه في الـ Frontend).
      // - 'user': بيانات المستخدم (اسم، إيميل، ID... إلخ).
      // الـ Refresh Token مابقاش بيرجع في الـ Body، بيرجع في HTTP-only cookie.
      const { token, user } = action.payload; // <<<<< بنستقبل 'token' و 'user' بس

      // بنحدث الـ State في Redux بالبيانات دي:
      state.authToken = token; // بنخزن الـ Access Token
      state.user = user;       // بنخزن بيانات المستخدم
      state.isAuthenticated = true; // بنعلم إن المستخدم مسجل دخول

      // بنحفظ الـ Access Token وبيانات المستخدم في الـ localStorage:
      // دي عشان لو المستخدم قفل الـ Browser وفتحه تاني، نقدر نجيب البيانات دي
      // ونحدث الـ Redux State بيها بدون ما يحتاج يسجل دخول تاني لو الـ Token لسه صالح.
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // بنمسح أي Refresh Token قديم كان ممكن يكون متخزن بالغلط في localStorage
      // (احتياطي، لو كنت بتخزنه هناك قبل كده).
      localStorage.removeItem('refreshToken');

      state.loading = false; // خلاص خلصنا تحميل حالة الـ Auth
    },

    // دالة logout: بتشتغل لما المستخدم يعمل تسجيل خروج.
    logout: (state) => {
      // بنمسح كل البيانات المتعلقة بالـ Auth من الـ State في Redux.
      state.authToken = null;
      state.user = null;
      state.isAuthenticated = false;

      // بنمسح البيانات دي كمان من الـ localStorage.
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      // بنمسح أي Refresh Token قديم كان ممكن يكون متخزن بالغلط في localStorage.
      localStorage.removeItem('refreshToken');

      state.loading = false;
    },

    // دالة setLoadingAuth: دالة مساعدة عشان نغير حالة الـ Loading.
    setLoadingAuth: (state, action) => {
      state.loading = action.payload; // الـ payload هنا هيكون true أو false.
    },
  },
});

// 4. تصدير الـ Actions والـ Selectors:
// Actions: الدوال اللي بنستدعيها عشان نغير الـ State.
export const { setCredentials, logout, setLoadingAuth } = authSlice.actions;

// Selectors: الدوال اللي بنستخدمها عشان نقرأ بيانات معينة من الـ Redux Store.
export const selectCurrentAuthToken = (state) => state.auth.authToken;
export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.loading;

// بنصدر الـ Reducer الرئيسي بتاع الـ Slice ده عشان نضيفه للـ Redux Store.
export default authSlice.reducer;