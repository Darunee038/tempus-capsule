import CapsuleCard from "./CapsuleCard";

const cards = [
  { key: "horawhisper", title: "HoraWhisper+", desc: "ส่งข้อความถึงตัวคุณในอนาคต เพื่อกลับมาอ่านในวันที่ใช่" },
  { key: "eterea", title: "EtereaMoment", desc: "เก็บทุกความทรงจำกับคนพิเศษ รอวันเปิดพร้อมกัน" },
  { key: "lova", title: "LovaNote", desc: "เก็บโน้ตบอกรัก แล้วส่งให้คนสำคัญในวันที่เหมาะ" },
  { key: "vermis", title: "VermisSandglass", desc: "ตั้งเป้าหมายชีวิตแล้วให้ตัวคุณในอนาคตกลับมาอ่านอีกครั้ง" },
];

export default function CapsuleGrid() {
  return (
    <section className="grid">
      {cards.map((c) => (
        <CapsuleCard key={c.key} item={c} />
      ))}
    </section>
  );
}
