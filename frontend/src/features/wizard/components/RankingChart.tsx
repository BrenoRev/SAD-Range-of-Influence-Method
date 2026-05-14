import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "@/shared/components/ui/Card";
import type { components } from "@/shared/types/api";

type RankingEntry = components["schemas"]["RankingEntry"];

type RankingChartProps = {
  ranking: RankingEntry[];
};

const ACCENT = "#5e6ad2";
const OK = "#16a34a";

export function RankingChart({ ranking }: RankingChartProps) {
  const data = ranking.map((r) => ({
    name: r.alternative,
    R: Number(r.R.toFixed(4)),
    rank: r.rank,
  }));
  const height = Math.max(180, ranking.length * 40 + 40);

  return (
    <Card className="p-5">
      <div className="mb-4 text-[13px] font-semibold text-ink">Score R</div>
      <div style={{ width: "100%", height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 8, right: 24, bottom: 8, left: 8 }}>
            <XAxis type="number" domain={[0, 1]} tick={{ fontSize: 11, fill: "#6b7280" }} />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 12, fill: "#1a1a1a" }}
              width={140}
            />
            <Tooltip
              cursor={{ fill: "rgba(0,0,0,0.04)" }}
              contentStyle={{
                background: "#fff",
                border: "1px solid #e6e6e6",
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(value: number) => [value.toFixed(4), "R"]}
            />
            <Bar dataKey="R" radius={[0, 4, 4, 0]}>
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.rank === 1 ? OK : ACCENT} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
