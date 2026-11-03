# 📊 Online Customer Behavior Analytics & Dashboard Pipeline

ระบบวิเคราะห์พฤติกรรมผู้ใช้ในการเลือกซื้อสินค้าออนไลน์ กระบวนการทำความสะอาดและตรวจสอบความถูกต้องของข้อมูล (Data Cleaning & Validation Pipeline) พร้อมการส่งออกข้อมูลสถิติไปยัง Web Dashboard แบบ Interactive

---

## 📁 โครงสร้างโปรเจกต์ (Project Structure)

```text
helpme/
├── DATA/                           # โฟลเดอร์จัดเก็บข้อมูลทั้งหมด
│   ├── raw/                        # ข้อมูลดิบดั้งเดิม (events.csv, item_properties_part1.csv, ฯลฯ)
│   ├── processed/                  # ข้อมูลที่ผ่านการ Cleaning แล้ว (events_cleaned.csv)
│   └── sample/                     # ข้อมูลตัวอย่างและพจนานุกรมข้อมูล (data_dictionary.csv)
├── docs/                           # เอกสารสรุปผลและรายงานประสิทธิภาพ
│   ├── reconciliation_note.md      # บันทึกการกระทบยอดข้อมูลก่อน-หลัง Clean
│   └── performance_report.md       # รายงานผลการวัดประสิทธิภาพเวลาโหลด Dashboard
├── notebooks/                      # Jupyter Notebooks สำหรับประมวลผลข้อมูล
│   ├── 01_data_cleaning_and_validation.ipynb  # ขั้นตอน Cleaning & Validation
│   ├── 02_exploratory_data_analysis.ipynb     # ขั้นตอน EDA & สกัด Insight
│   └── 03_export_dashboard_data.ipynb        # ขั้นตอน Aggregate & Export ไปยัง js/data.js
├── css/                            # ไฟล์จัดการสไตล์และเค้าโครงหน้าเว็บ
│   └── style.css
├── js/                             # สคริปต์ควบคุมการทำงานและแสดงผล Dashboard
│   ├── data.js                     # ข้อมูลที่ Export อัตโนมัติจาก Notebook 03
│   └── main.js                     # สคริปต์วาด Chart และควบคุม Filter
├── index.html                      # หน้าหลักของ Web Dashboard
├── requirements.txt                # รายชื่อ Python Libraries ที่ต้องใช้
└── README.md                       # คู่มืออธิบายการติดตั้งและใช้งานโปรเจกต์