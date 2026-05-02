/**
 * LangContext.jsx — Global language context (Arabic / English).
 * Provides a t() translation helper and a toggle function.
 * Switching language flips the document dir attribute automatically.
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

// ─── Translation strings ──────────────────────────────────────────────────────
const strings = {
  ar: {
    // Header
    enterName:    'سجّل اسمك',
    // UserModal
    yourProfile:  'ملفّك التخصصي',
    writeYourName:'اكتب اسمك',
    nameLabel:    'الاسم *',
    namePh:       'اسمك هنا…',
    emailLabel:   'الإيميل (اختياري)',
    save:         'حفظ',
    emailHint:    'الإيميل اختياري — بيساعدنا نتعرف عليكِ في زياراتك القادمة 💕',
    // Products
    all:          'الكل',
    loading:      'جاري التحميل…',
    noProducts:   'لا توجد منتجات في هذه الفئة',
    inquire:      'استفسر عن المنتج',
    // Comments
    addComment:   'أضف تعليقًا…',
    noComments:   'لا توجد تعليقات بعد — كوني أول من يعلق! ✨',
    reply:        'ردّ',
    yourName:     'اسمك…',
    addReply:     'أضف ردًّا…',
    send:         'إرسال',
    // Stories
    replyToStory: 'ردّ على الستوري',
    replyTo:      n => `ردّ على ${n}...`,
    like:         'إعجاب',
    share:        'مشاركة',
    linkCopied:   '✓ تم نسخ الرابط!',
    // Order modal
    readyMsg:     'رسالتك الجاهزة:',
    copyMsg:      '📋 نسخ الرسالة',
    openIG:       '📩 خاص الإنستا',
    copied:       '✓ تم النسخ!',
    // Footer
    allRights:    'جميع الحقوق محفوظة',
    // Admin
    adminCommentPh: 'اكتب تعليقًا كـ Glamax CRS… (Enter للإرسال)',
    // Story reply form
    replyFormTitle:  'ردّ على الستوري',
    replyNamePh:     'اسمك…',
    replyMsgPh:      'اكتبي ردّك هنا…',
    sendReply:       'إرسال الرد',
    replySent:       '✓ تم إرسال ردّك بنجاح!',
    replySentSub:    'سيصلك رد من Glamax CRS قريباً 💕',
  },
  en: {
    enterName:    'Enter your name',
    yourProfile:  'Your Profile',
    writeYourName:'Write your name',
    nameLabel:    'Name *',
    namePh:       'Your name here…',
    emailLabel:   'Email (optional)',
    save:         'Save',
    emailHint:    'Email is optional — helps us recognise you on future visits 💕',
    all:          'All',
    loading:      'Loading…',
    noProducts:   'No products in this category',
    inquire:      'Inquire about product',
    addComment:   'Add a comment…',
    noComments:   'No comments yet — be the first! ✨',
    reply:        'Reply',
    yourName:     'Your name…',
    addReply:     'Add a reply…',
    send:         'Send',
    replyToStory: 'Reply to story',
    replyTo:      n => `Reply to ${n}...`,
    like:         'Like',
    share:        'Share',
    linkCopied:   '✓ Link copied!',
    readyMsg:     'Your ready message:',
    copyMsg:      '📋 Copy message',
    openIG:       '📩 Instagram DM',
    copied:       '✓ Copied!',
    allRights:    'All rights reserved',
    adminCommentPh: 'Write a comment as Glamax CRS… (Enter to send)',
    // Story reply form
    replyFormTitle:  'Reply to story',
    replyNamePh:     'Your name…',
    replyMsgPh:      'Write your reply here…',
    sendReply:       'Send reply',
    replySent:       '✓ Reply sent successfully!',
    replySentSub:    'Glamax CRS will get back to you soon 💕',
  }
};

const LangContext = createContext(null);

export function useLang() {
  return useContext(LangContext);
}

/**
 * @param {{ children: React.ReactNode }} props
 */
export function LangProvider({ children }) {
  const [lang, setLang] = useState('ar');

  // Sync HTML dir and lang attributes
  useEffect(() => {
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
  }, [lang]);

  const toggle = useCallback(() => setLang(l => (l === 'ar' ? 'en' : 'ar')), []);

  /** Translates a key; for function values calls it with optional arg */
  const t = useCallback((key, arg) => {
    const val = strings[lang]?.[key] ?? strings.ar[key] ?? key;
    return typeof val === 'function' ? val(arg) : val;
  }, [lang]);

  return (
    <LangContext.Provider value={{ lang, toggle, t }}>
      {children}
    </LangContext.Provider>
  );
}
