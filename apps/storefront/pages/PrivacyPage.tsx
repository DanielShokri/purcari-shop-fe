import React from 'react';
import { Shield, Lock, Eye, Database, Mail, Trash2 } from 'lucide-react';
import SEO from '../components/SEO';

const PrivacyPage: React.FC = () => {
  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <SEO 
        title="מדיניות פרטיות"
        description="מדיניות הפרטיות של פורקארי ישראל. כיצד אנו אוספים, משתמשים ומגנים על המידע שלכם."
        canonical="/privacy"
      />
      
      {/* Header */}
      <div className="bg-gray-900 text-white py-12 mb-10">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-2">מדיניות פרטיות</h1>
          <p className="text-gray-400">עודכן לאחרונה: ינואר 2026</p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm">
          {/* Introduction */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8 flex items-start gap-4">
            <Shield className="text-green-600 flex-shrink-0 mt-1" size={24} />
            <div>
              <h3 className="font-bold text-green-800 mb-2">המחויבות שלנו לפרטיות</h3>
              <p className="text-green-700">
                פורקארי ישראל מחויבת להגן על פרטיותכם. מסמך זה מפרט כיצד אנו אוספים, 
                משתמשים ומגנים על המידע האישי שלכם.
              </p>
            </div>
          </div>

          <div className="space-y-8 text-gray-700 leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Database size={20} className="text-secondary" />
                1. איסוף מידע
              </h2>
              <p className="mb-4">אנו אוספים מידע בדרכים הבאות:</p>
              
              <h3 className="font-bold mt-4 mb-2">מידע שאתם מספקים:</h3>
              <ul className="space-y-2 list-disc list-inside">
                <li>פרטים אישיים בעת הרשמה (שם, אימייל, טלפון)</li>
                <li>כתובת למשלוח</li>
                <li>פרטי תשלום (מעובדים באופן מאובטח דרך ספק תשלומים)</li>
                <li>העדפות ובקשות מיוחדות</li>
              </ul>

              <h3 className="font-bold mt-4 mb-2">מידע שנאסף אוטומטית:</h3>
              <ul className="space-y-2 list-disc list-inside">
                <li>כתובת IP ומידע על הדפדפן</li>
                <li>עמודים שנצפו ופעולות באתר</li>
                <li>מקור ההגעה לאתר</li>
                <li>מידע מקובצי Cookie (עוגיות)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Eye size={20} className="text-secondary" />
                2. שימוש במידע
              </h2>
              <p className="mb-4">אנו משתמשים במידע שנאסף למטרות הבאות:</p>
              <ul className="space-y-2 list-disc list-inside">
                <li>עיבוד והשלמת הזמנות</li>
                <li>שליחת עדכונים על סטטוס הזמנות</li>
                <li>מענה לפניות שירות לקוחות</li>
                <li>שליחת ניוזלטר ומבצעים (בהסכמתכם)</li>
                <li>שיפור האתר וחווית המשתמש</li>
                <li>מניעת הונאות ואבטחת האתר</li>
                <li>עמידה בדרישות חוקיות</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Lock size={20} className="text-secondary" />
                3. אבטחת מידע
              </h2>
              <p className="mb-4">
                אנו נוקטים באמצעי אבטחה מתקדמים להגנה על המידע שלכם:
              </p>
              <ul className="space-y-2 list-disc list-inside">
                <li>הצפנת SSL לכל התקשורת באתר</li>
                <li>אחסון מאובטח של נתונים</li>
                <li>גישה מוגבלת למידע אישי רק לעובדים מורשים</li>
                <li>עיבוד תשלומים דרך ספקים מאובטחים ומוסמכים (PCI DSS)</li>
                <li>סקירות אבטחה תקופתיות</li>
              </ul>
              <p className="mt-4 text-sm text-gray-500">
                * פרטי כרטיסי אשראי מעובדים ישירות על ידי ספק התשלומים ואינם נשמרים בשרתים שלנו.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Shield size={20} className="text-secondary" />
                4. שיתוף מידע
              </h2>
              <p className="mb-4">
                אנו לא מוכרים, משכירים או משתפים את המידע האישי שלכם עם צדדים שלישיים, למעט:
              </p>
              <ul className="space-y-2 list-disc list-inside">
                <li>ספקי שירותים הכרחיים (משלוחים, עיבוד תשלומים)</li>
                <li>כאשר נדרש על פי חוק</li>
                <li>להגנה על זכויותינו או בטיחות משתמשים</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Database size={20} className="text-secondary" />
                5. עוגיות (Cookies)
              </h2>
              <p className="mb-4">
                האתר משתמש בעוגיות לצורך:
              </p>
              <ul className="space-y-2 list-disc list-inside">
                <li>שמירת העדפות המשתמש</li>
                <li>ניהול סל הקניות</li>
                <li>זיהוי משתמשים מחוברים</li>
                <li>ניתוח סטטיסטי של השימוש באתר</li>
              </ul>
              <p className="mt-4">
                ניתן לנהל את הגדרות העוגיות דרך הדפדפן. שימו לב שחסימת עוגיות 
                עשויה לפגוע בחלק מהפונקציונליות באתר.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Trash2 size={20} className="text-secondary" />
                6. הזכויות שלכם
              </h2>
              <p className="mb-4">
                על פי חוק הגנת הפרטיות, עומדות לכם הזכויות הבאות:
              </p>
              <ul className="space-y-2 list-disc list-inside">
                <li>זכות לעיין במידע שנאסף עליכם</li>
                <li>זכות לתקן מידע שגוי</li>
                <li>זכות לבקש מחיקת המידע</li>
                <li>זכות להתנגד לשימוש מסוים במידע</li>
                <li>זכות לבטל הרשמה לדיוור בכל עת</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Mail size={20} className="text-secondary" />
                7. דיוור ושיווק
              </h2>
              <p>
                אם נרשמתם לניוזלטר שלנו, אנו עשויים לשלוח לכם עדכונים על מוצרים חדשים ומבצעים. 
                תוכלו לבטל את ההרשמה בכל עת על ידי לחיצה על קישור "הסר מרשימת התפוצה" 
                בתחתית כל הודעה, או על ידי פנייה אלינו ישירות.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Shield size={20} className="text-secondary" />
                8. שמירת מידע
              </h2>
              <p>
                אנו שומרים את המידע האישי שלכם כל עוד הוא נדרש למטרות שלשמן נאסף, 
                או כנדרש על פי חוק. לאחר מכן, המידע נמחק או הופך לאנונימי.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Shield size={20} className="text-secondary" />
                9. שינויים במדיניות
              </h2>
              <p>
                אנו עשויים לעדכן מדיניות זו מעת לעת. שינויים מהותיים יפורסמו באתר 
                ו/או יישלחו לכם בהודעה. המשך השימוש באתר לאחר השינויים מהווה הסכמה למדיניות המעודכנת.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Mail size={20} className="text-secondary" />
                10. יצירת קשר
              </h2>
              <p>
                לשאלות או בקשות הנוגעות לפרטיות, ניתן לפנות אלינו:
              </p>
              <ul className="mt-3 space-y-2">
                <li>טלפון: 050-9480040</li>
                <li>אימייל: ivninov45@gmail.com</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
