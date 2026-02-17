
export const UNIT_COMMON_MISTAKES = {
    unit_1: [
        { title: 'Decomposition Trap', desc: 'แตกปัญหาละเอียดเกินไปจนจัดการยาก หรือหยาบเกินไปจนลงมือทำไม่ได้จริง' },
        { title: 'Abstraction Fear', desc: 'กลัวที่จะตัดรายละเอียดทิ้ง พยายามเก็บทุกอย่างไว้จนหลงประเด็นสำคัญ' },
        { title: 'Algorithm != Code', desc: 'เข้าใจผิดว่าต้องเขียนเป็นภาษาโปรแกรมทันที แทนที่จะเขียนเป็นลำดับความคิด (Pseudocode) ก่อน' }
    ],
    unit_2: [
        { title: 'Scope Creep', desc: 'อยากเพิ่มฟีเจอร์เรื่อยๆ ระหว่างทำ จนงานไม่เสร็จตามกำหนด (Timeboxing ช่วยได้)' },
        { title: 'Skipping Design', desc: 'รีบเขียนโค้ดโดยไม่วาดหน้าจอ (UI) หรือวางแผนข้อมูลก่อน ทำให้ต้องรื้อทำใหม่บ่อยๆ' },
        { title: 'User Ignorance', desc: 'ทำสิ่งที่ "เราอยากได้" ไม่ใช่สิ่งที่ "ผู้ใช้ต้องการ" (ต้อง Empathize ก่อนเสมอ)' }
    ],
    unit_3: [
        { title: 'System Boundary', desc: 'กำหนดขอบเขตของระบบไม่ชัดเจน ทำให้วิเคราะห์ปัจจัยภายนอก (Environment) ปนกับภายในระบบ' },
        { title: 'Feedback Confusion', desc: 'สับสนระหว่าง Output (ผลผลิต) กับ Feedback (ข้อมูลย้อนกลับเพื่อควบคุมระบบ)' },
        { title: 'Ignoring Side Effects', desc: 'สนใจแต่ผลกระทบด้านบวก จนลืมคิดถึงผลกระทบด้านลบต่อสังคมและสิ่งแวดล้อม' }
    ],
    unit_4: [
        { title: 'First Idea Bias', desc: 'ยึดติดกับไอเดียแรกที่คิดได้ และไม่ยอมปรับปรุงหรือหาทางเลือกอื่นที่ดีกว่า' },
        { title: 'Prototyping Perfection', desc: 'เสียเวลากับการทำต้นแบบให้สวยงามเกินความจำเป็น (ควรเน้นทำเร็ว ล้มเหลวเร็ว เพื่อเรียนรู้)' },
        { title: 'Tool Misuse', desc: 'เลือกใช้วัสดุหรือเครื่องมือไม่เหมาะสมกับงาน เช่น ใช้กาวร้อนติดโฟม (โฟมละลาย)' }
    ],
    unit_5: [
        { title: 'Presentation Overload', desc: 'ใส่เนื้อหาในสไลด์แน่นเกินไป อ่านตามสไลด์ให้ฟัง (ควรเน้นภาพและเล่าเรื่อง)' },
        { title: 'Copyright Infringement', desc: 'นำรูปหรือเพลงที่มีลิขสิทธิ์มาใช้โดยไม่ขออนุญาตหรือให้เครดิต (ควรใช้ Creative Commons)' },
        { title: 'Silent Failure', desc: 'ไม่กล้าบอกปัญหาที่เจอระหว่างทำโครงงาน (ควรระบุปัญหาและวิธีแก้ในรายงาน)' }
    ]
};

export const CAREER_PATHS = {
    unit_1: [
        { title: 'Data Scientist', desc: 'นักวิทยาศาสตร์ข้อมูล: ใช้ Pattern Recognition หาข้อมูลเชิงลึกจากข้อมูลมหาศาล' },
        { title: 'Algorithm Engineer', desc: 'วิศวกรอัลกอริทึม: ออกแบบลำดับขั้นตอนการทำงานของ AI และระบบซับซ้อน' },
        { title: 'System Analyst', desc: 'นักวิเคราะห์ระบบ: ใช้ Decomposition และ Abstraction เพื่อวางแผนระบบ IT' }
    ],
    unit_2: [
        { title: 'Product Manager (PM)', desc: 'ผู้จัดการผลิตภัณฑ์: ดูแลวงจร SDLC ตั้งแต่เก็บ Requirement จนถึงส่งมอบงาน' },
        { title: 'UX/UI Designer', desc: 'นักออกแบบประสบการผู้ใช้: ออกแบบหน้าจอและการใช้งานแอปพลิเคชัน' },
        { title: 'Software Tester (QA)', desc: 'นักทดสอบระบบ: ตรวจสอบคุณภาพซอฟต์แวร์ก่อนใช้งานจริง' }
    ],
    unit_3: [
        { title: 'Systems Engineer', desc: 'วิศวกรระบบ: ออกแบบและบริหารจัดการระบบขนาดใหญ่ เช่น ระบบขนส่ง, โรงงาน' },
        { title: 'Environmental Consultant', desc: 'ที่ปรึกษาด้านสิ่งแวดล้อม: วิเคราะห์ผลกระทบของเทคโนโลยีต่อธรรมชาติ' },
        { title: 'IoT Specialist', desc: 'ผู้เชี่ยวชาญ Internet of Things: เชื่อมต่ออุปกรณ์ต่างๆ ให้ทำงานร่วมกันเป็นระบบ' }
    ],
    unit_4: [
        { title: 'Mechanical Engineer', desc: 'วิศวกรเครื่องกล: ออกแบบชิ้นส่วนและกลไกต่างๆ ของเครื่องจักร' },
        { title: 'Industrial Designer', desc: 'นักออกแบบผลิตภัณฑ์อุตสาหกรรม: ออกแบบรูปทรงสินค้าให้สวยงามและน่าใช้' },
        { title: 'Maker / Inventor', desc: 'นักประดิษฐ์: สร้างสรรค์นวัตกรรมใหม่ๆ เพื่อแก้ปัญหา' }
    ],
    unit_5: [
        { title: 'Startup Founder', desc: 'ผู้ก่อตั้งธุรกิจสตาร์ทอัพ: เปลี่ยนไอเดียโครงงานให้กลายเป็นธุรกิจจริง' },
        { title: 'Intellectual Property Lawyer', desc: 'ทนายความทรัพย์สินทางปัญญา: ดูแลเรื่องลิขสิทธิ์และสิทธิบัตร' },
        { title: 'Content Creator', desc: 'นักสร้างคอนเทนต์: นำเสนอเรื่องราวให้น่าสนใจผ่านสื่อดิจิทัล' }
    ]
};

export const REAL_WORLD_APPLICATION = {
    unit_1: {
        company: 'Netflix',
        desc: 'Netflix ใช้ Pattern Recognition วิเคราะห์ประวัติการดูของคุณ เพื่อแนะนำหนังที่คุณน่าจะชอบ (Recommendation Algorithm)'
    },
    unit_2: {
        company: 'Agile & DevOps',
        desc: 'บริษัทเทคโนโลยีทั่วโลกใช้วงจรการพัฒนาแบบ SDLC แต่มักปรับให้เร็วขึ้นเรียกว่า Agile เพื่อส่งมอบฟีเจอร์ใหม่ๆ ให้ผู้ใช้ได้ทุกสัปดาห์'
    },
    unit_3: {
        company: 'Tesla Autopilot',
        desc: 'รถยนต์ไร้คนขับเป็นระบบที่ซับซ้อนมาก (Complex System) ต้องรับ Input จากกล้อง/เรดาห์ ประมวลผล (Process) และสั่งการพวงมาลัย/เบรก (Output) แบบ Real-time'
    },
    unit_4: {
        company: 'Dyson',
        desc: 'James Dyson สร้างพัดลมไร้ใบพัดต้นแบบ (Prototype) กว่า 5,127 ชิ้น และล้มเหลวมากมาย ก่อนที่จะได้ผลิตภัณฑ์ที่สมบูรณ์แบบ'
    },
    unit_5: {
        company: 'Shark Tank',
        desc: 'รายการธุรกิจชื่อดังที่ผู้ประกอบการต้อง "Pitching" ไอเดียธุรกิจภายใน 3 นาที เพื่อโน้มน้าวนักลงทุนให้ได้เงินระดมทุน'
    }
};
