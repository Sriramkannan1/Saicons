import { motion } from "framer-motion";

const nodes = [
  { id: 1, cx: 647, cy: 153, r: 4, label: "Innovation" },
  { id: 2, cx: 813, cy: 327, r: 6, label: "Ideas" },
  { id: 3, cx: 729, cy: 590, r: 5, label: "Global" },
  { id: 4, cx: 160, cy: 160, r: 5, label: "Service" },
  { id: 5, cx: 7, cy: 330, r: 4, label: "Youth" },
  { id: 6, cx: 28, cy: 615, r: 6, label: "Action" },
  { id: 7, cx: 338, cy: 754, r: 5, label: "Fellowship" },
];

const edges = [
  { source: 1, target: 2 },
  { source: 2, target: 3 },
  { source: 4, target: 5 },
  { source: 5, target: 6 },
  { source: 6, target: 7 },
  { source: 1, target: 4 },
  { source: 3, target: 7 },
];

export function NodeNetwork() {
  return (
    <div className="absolute inset-0 pointer-events-none z-10 hidden sm:block">
      <svg className="w-full h-full drop-shadow-[0_0_15px_rgba(0,168,255,0.5)]" viewBox="0 0 800 800">
        <defs>
          <filter id="glow-node" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Edges */}
        {edges.map((edge, i) => {
          const source = nodes.find((n) => n.id === edge.source)!;
          const target = nodes.find((n) => n.id === edge.target)!;
          return (
            <motion.line
              key={`edge-${i}`}
              x1={source.cx}
              y1={source.cy}
              x2={target.cx}
              y2={target.cy}
              stroke="#00a8ff"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              initial={{ opacity: 0, pathLength: 0 }}
              animate={{ 
                opacity: [0.1, 0.6, 0.1],
                pathLength: [0, 1]
              }}
              transition={{ 
                opacity: { duration: 3 + Math.random() * 2, repeat: Infinity, ease: "easeInOut" },
                pathLength: { duration: 2, ease: "easeOut" }
              }}
            />
          );
        })}

        {/* Nodes and Labels */}
        {nodes.map((node) => (
          <g key={`node-${node.id}`}>
            {/* Pulsing ring */}
            <motion.circle
              cx={node.cx}
              cy={node.cy}
              r={node.r * 2.5}
              fill="none"
              stroke="#00a8ff"
              strokeWidth="1"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: [1, 2], opacity: [0.8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: Math.random() }}
            />
            {/* Core node */}
            <motion.circle
              cx={node.cx}
              cy={node.cy}
              r={node.r}
              fill="#fff"
              filter="url(#glow-node)"
              initial={{ scale: 0.8 }}
              animate={{ scale: [1, 1.4, 1] }}
              transition={{ duration: 1.5 + Math.random(), repeat: Infinity, ease: "easeInOut" }}
            />
            {/* Text Label */}
            <motion.text
              x={node.cx + 15}
              y={node.cy + 4}
              fill="#00a8ff"
              fontSize="12"
              fontFamily="monospace"
              letterSpacing="2"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 0.8, x: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              {node.label}
            </motion.text>
          </g>
        ))}
      </svg>
    </div>
  );
}
