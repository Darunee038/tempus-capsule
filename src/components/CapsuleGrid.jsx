import CapsuleCard from "./CapsuleCard";

const cards = [
  {
    key: "horawhisper",
    title: "HoraWhisper+",
    desc: "Send a message to your future self,\nand rediscover it when the time comes."
  },
  {
    key: "eterea",
    title: "EtereaMoment",
    desc: "Preserve meaningful memories with special people\nand open them together in the future."
  },
  {
    key: "lova",
    title: "LovaNote",
    desc: "Write heartfelt notes\nand deliver them to someone special at the perfect moment."
  },
  {
    key: "vermis",
    title: "VermisSandglass",
    desc: "Set life goals today\nand revisit them in the future to see how you’ve grown."
  }
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
