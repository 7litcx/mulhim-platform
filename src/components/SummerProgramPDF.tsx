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
        padding: '40px',
        backgroundColor: 'white',
        color: '#333',
        direction: 'rtl',
        fontFamily: 'Arial, sans-serif',
        position: 'absolute',
        top: '-10000px', // hidden offscreen
        left: '-10000px',
        zIndex: -1,
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '28px', color: '#1e293b', marginBottom: '5px' }}>استمارة مشاركة</h1>
        <h2 style={{ fontSize: '18px', color: '#64748b' }}>برنامج لون صيفك 3</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        <div>
          <strong>اسم المتقدم / ة رباعيًا:</strong> {data.fullName}
        </div>
        <div>
          <strong>رقم الهوية:</strong> {data.idNumber}
        </div>
        <div>
          <strong>الصف الدراسي العام الماضي:</strong> {data.grade}
        </div>
        <div>
          <strong>تاريخ الميلاد:</strong> {data.birthDate}
        </div>
        <div>
          <strong>الجنس:</strong> {data.gender}
        </div>
        <div>
          <strong>العمر:</strong> {data.age}
        </div>
        <div style={{ gridColumn: 'span 2' }}>
          <strong>عنوان الحي الذي تسكن به:</strong> {data.neighborhood}
        </div>
        <div>
          <strong>جوال ولي الأمر:</strong> {data.parentPhone}
        </div>
        <div>
          <strong>جوال آخر:</strong> {data.otherPhone || '---'}
        </div>
      </div>

      <hr style={{ borderColor: '#e2e8f0', margin: '20px 0' }} />

      <div style={{ marginBottom: '20px', lineHeight: '1.8' }}>
        <div>
          <strong>هل يعاني المتقدم/ة من أي أمراض:</strong> {data.hasDiseases} {data.hasDiseases === 'نعم' ? `(${data.diseasesDetails})` : ''}
        </div>
        <div>
          <strong>هل يعاني المتقدم/ة من حساسية أطعمة:</strong> {data.hasAllergies} {data.hasAllergies === 'نعم' ? `(${data.allergiesDetails})` : ''}
        </div>
        <div>
          <strong>كيف عرفت عن البرنامج:</strong> {data.howDidYouHear}
        </div>
      </div>

      <div style={{ backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3 style={{ textAlign: 'center', marginBottom: '10px' }}>تعهد</h3>
        <p style={{ fontSize: '12px', textAlign: 'justify', lineHeight: '1.6' }}>
          أتعهد أنا الموقع أدناه (ولي أمر المشارك/ة) بأن أتقيد بجميع الأنظمة والتعليمات الخاصة بالبرنامج وأن أتحلى بالآداب الإسلامية والأخلاق الرياضية الحميدة في تعاملي مع المعلمين والمشاركين وللإدارة كامل الحق في إلغاء اشتراكي واتخاذ القرار الذي تراه مناسباً في حالة مخالفتي لذلك. كما أقر بأني قرأت جميع الأنظمة والتعليمات أدناه.
        </p>
      </div>

      <div style={{ backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px', marginBottom: '30px' }}>
        <h3 style={{ textAlign: 'center', marginBottom: '10px' }}>أنظمة وتعليمات</h3>
        <p style={{ fontSize: '10px', lineHeight: '1.6', columnCount: 2, columnGap: '20px' }}>
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

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '40px' }}>
        <div>
          <strong>التوقيع:</strong>
          <div style={{ marginTop: '10px', height: '100px', width: '200px', borderBottom: '1px solid #ccc' }}>
            {data.signature ? (
              <img src={data.signature} alt="Signature" style={{ maxHeight: '100px', maxWidth: '200px' }} />
            ) : null}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <strong>التاريخ:</strong>
          <div style={{ marginTop: '10px', width: '150px', borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>
            {new Date(registration.created_at).toLocaleDateString('ar-SA')}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <strong>الاسم:</strong>
          <div style={{ marginTop: '10px', width: '200px', borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>
            {data.fullName}
          </div>
        </div>
      </div>
    </div>
  );
});

SummerProgramPDF.displayName = 'SummerProgramPDF';
