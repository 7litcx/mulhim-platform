import React from 'react';

interface Props {
  registration: any;
}

export const SummerProgramPDF = React.forwardRef<HTMLDivElement, Props>(({ registration }, ref) => {
  if (!registration || !registration.extra_data) return null;

  const data = registration.extra_data;

  return (
    <div 
      ref={ref} 
      style={{
        width: '800px', // A4 width proportion
        minHeight: '1130px', // A4 height proportion
        backgroundColor: 'white',
        color: '#1e293b',
        direction: 'rtl',
        fontFamily: 'Arial, sans-serif',
        position: 'absolute',
        top: '-10000px', // hidden offscreen
        left: '-10000px',
        zIndex: -1,
        overflow: 'hidden'
      }}
    >
      {/* Custom Background Image */}
      <img 
        src="/images/pdf-bg.jpeg" 
        alt="Background" 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 0
        }} 
      />

      {/* Content Container */}
      <div style={{ position: 'relative', zIndex: 1, padding: '160px 60px 20px 60px' }}>
      <div style={{ textAlign: 'center', marginBottom: '15px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#009088', marginBottom: '0' }}>استمارة تسجيل ومشاركة</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px', fontSize: '14px' }}>
        <div>
          <strong style={{ color: '#009088' }}>اسم المتقدم / ة رباعيًا:</strong> {data.fullName}
        </div>
        <div>
          <strong style={{ color: '#009088' }}>رقم الهوية:</strong> {data.idNumber}
        </div>
        <div>
          <strong style={{ color: '#009088' }}>اسم ولي الأمر:</strong> {data.parentName || 'غير متوفر'}
        </div>
        <div>
          <strong style={{ color: '#009088' }}>الصف الدراسي العام الماضي:</strong> {data.grade}
        </div>
        <div>
          <strong style={{ color: '#009088' }}>تاريخ الميلاد:</strong> {data.birthDate}
        </div>
        <div>
          <strong style={{ color: '#009088' }}>الجنس:</strong> {data.gender}
        </div>
        <div>
          <strong style={{ color: '#009088' }}>العمر:</strong> {data.age}
        </div>
        <div style={{ gridColumn: 'span 2' }}>
          <strong style={{ color: '#009088' }}>عنوان الحي الذي تسكن به:</strong> {data.neighborhood}
        </div>
        <div>
          <strong style={{ color: '#009088' }}>جوال ولي الأمر:</strong> {data.parentPhone}
        </div>
        <div>
          <strong style={{ color: '#009088' }}>جوال آخر:</strong> {data.otherPhone || '---'}
        </div>
      </div>

      <hr style={{ borderColor: '#e2e8f0', margin: '10px 0' }} />

      <div style={{ marginBottom: '10px', lineHeight: '1.6', fontSize: '14px' }}>
        <div>
          <strong style={{ color: '#009088' }}>هل يعاني المتقدم/ة من أي أمراض:</strong> {data.hasDiseases} {data.hasDiseases === 'نعم' ? `(${data.diseasesDetails})` : ''}
        </div>
        <div>
          <strong style={{ color: '#009088' }}>هل يعاني المتقدم/ة من حساسية أطعمة:</strong> {data.hasAllergies} {data.hasAllergies === 'نعم' ? `(${data.allergiesDetails})` : ''}
        </div>
        <div>
          <strong style={{ color: '#009088' }}>كيف عرفت عن البرنامج:</strong> {data.howDidYouHear}
        </div>
      </div>

      <div style={{ backgroundColor: '#f8fafc', padding: '10px', borderRadius: '8px', marginBottom: '10px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ textAlign: 'center', marginBottom: '5px', color: '#1e293b', fontSize: '16px' }}>تعهد</h3>
        <p style={{ fontSize: '12px', textAlign: 'justify', lineHeight: '1.5', color: '#334155', margin: 0 }}>
          أتعهد أنا الموقع أدناه (ولي أمر المشارك/ة) بأن أتقيد بجميع الأنظمة والتعليمات الخاصة بالبرنامج وأن أتحلى بالآداب الإسلامية والأخلاق الرياضية الحميدة في تعاملي مع المعلمين والمشاركين وللإدارة كامل الحق في إلغاء اشتراكي واتخاذ القرار الذي تراه مناسباً في حالة مخالفتي لذلك. كما أقر بأني قرأت جميع الأنظمة والتعليمات أدناه.
        </p>
      </div>

      <div style={{ backgroundColor: '#f8fafc', padding: '10px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ textAlign: 'center', marginBottom: '5px', color: '#1e293b', fontSize: '16px' }}>أنظمة وتعليمات</h3>
        <p style={{ fontSize: '10px', lineHeight: '1.4', columnCount: 2, columnGap: '20px', color: '#334155', margin: 0 }}>
          ١- سوف يتم فتح ملف لكل منتسب بالبرنامج الصيفي، يحوي عدة نماذج تشمل معلوماته الشخصية مع صورة هويته أو هوية والده إذا كان مضافًا في بطاقة العائلة.<br/>
          ٢- التقيد بالنظافة الشخصية وارتداء الملابس المحتشمة التي تستر العورة وتجنب ارتداء الملابس الضيقة أو التي تحمل عبارات غير لائقة والالتزام بالآداب الإسلامية العامة وعدم التلفظ بكلمات بذيئة أو جارحة.<br/>
          ٣- على المشاركين إخلاء الملاعب وجميع الفصول وحمام السباحة قبل الصلاة بمدة لا تزيد عن ٥ دقائق استعدادًا للصلاة أو الانصراف من البرنامج.<br/>
          ٤- لا يحق لأي مشارك المطالبة باسترجاع رسوم الاشتراك بعد حضور اليوم الثاني للبرنامج.<br/>
          ٥- لدى برنامج لون صيفك ٣ (والذي يمثلها مكتب سرج للاستشارات التربوية والتعليمية) الحقوق الحصرية باستخدام صور المشتركين خلال أي دورة تدريبية أو أنشطة وبذلك يسمح باستخدام جميع الصور والفيديوهات للإعلانات والحملات الترويجية من خلال كافة وسائل الإعلام المرئية والمسموعة والمقروءة.<br/>
          ٦- يتحمل المشترك تكلفة أي ضرر أو تلف بممتلكات البرنامج أو المشاركين بها.<br/>
          ٧- نرجو الالتزام بوقت الحضور والانصراف للبرنامج من الساعة السادسة مساءً إلى الساعة الحادية عشر مساءً.<br/>
          ٨- مدة البرنامج شهر كامل ٤ أيام أسبوعيًا تبدأ من الأربعاء ١٤٤٨/٠١/٢٣ هـ إلى الأربعاء ١٤٤٨/٠٢/٢٢ هـ.<br/>
          ٩- حضور المشارك يكون بالزي الخاص بالبرنامج.<br/>
          ١٠- في حال كان المشارك يعاني من أي أمراض مزمنة أو حساسية من أطعمة معينة يتم إبلاغ مشرف المرحلة بذلك لمتابعته.<br/>
          ١١- سيتم عمل قروب خاص لأولياء الأمور في كل مجموعة ويرسل فيه كل مايخص البرنامج من جداول وفعاليات وتعليمات وتقارير يومية مرئية.<br/>
          ١٢- في حال وجود أي ملاحظة أو استفسار لاتتردد بالاتصال على الرقم (٠٥٦٤٦٠٥٠٥٥).<br/>
          ١٣- وقت حصة السباحة نرجو إحضار ملابس خاصة بالسباحة مع منشفة (يمنع السباحة بملابس قطنية).<br/>
          ١٤- ختامًا: نتمنى لأبنائكم صيف ممتع وفعاليات متنوعة وبرامج هادفة برفقة كادر إشراف تربوي متميز.<br/>
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '10px', fontSize: '14px' }}>
        <div style={{ textAlign: 'center' }}>
          <strong style={{ color: '#009088' }}>التوقيع:</strong>
          <div style={{ marginTop: '5px', height: '80px', width: '200px', borderBottom: '2px dashed #009088', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {data.signature ? (
              <img src={data.signature} alt="Signature" style={{ maxHeight: '80px', maxWidth: '180px', objectFit: 'contain' }} />
            ) : null}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <strong style={{ color: '#009088' }}>التاريخ:</strong>
          <div style={{ marginTop: '5px', width: '150px', borderBottom: '1px solid #94a3b8', paddingBottom: '2px' }}>
            {new Date(registration.created_at).toLocaleDateString('ar-SA')}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <strong style={{ color: '#009088' }}>اسم ولي الأمر:</strong>
          <div style={{ marginTop: '5px', width: '200px', borderBottom: '1px solid #94a3b8', paddingBottom: '2px' }}>
            {data.parentName || data.fullName}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
});

SummerProgramPDF.displayName = 'SummerProgramPDF';
