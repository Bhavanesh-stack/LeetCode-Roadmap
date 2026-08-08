import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import './App.css';
import { NEETCODE_DATA } from './neetcodeData';

// Dynamic Eel helper
const getEel = () => window.eel || {
  get_vault_statuses: () => Promise.resolve({ "Two Sum": "Completed" }),
  toggle_question_status: (title, topic, currentStatus) =>
    Promise.resolve(currentStatus === 'Completed' ? 'Incomplete' : 'Completed'),
};

const TOPIC_METADATA = {
  "Arrays & Hashing": { icon: "📊", cat: "cat-blue" },
  "Two Pointers": { icon: "👈", cat: "cat-purple" },
  "Stack": { icon: "📚", cat: "cat-orange" },
  "Binary Search": { icon: "🔍", cat: "cat-green" },
  "Sliding Window": { icon: "🪟", cat: "cat-teal" },
  "Linked List": { icon: "🔗", cat: "cat-pink" },
  "Trees": { icon: "🌳", cat: "cat-green" },
  "Tries": { icon: "🌲", cat: "cat-purple" },
  "Heap / Priority Queue": { icon: "⚡", cat: "cat-orange" },
  "Backtracking": { icon: "🔄", cat: "cat-pink" },
  "Intervals": { icon: "⏱️", cat: "cat-teal" },
  "Greedy": { icon: "🤑", cat: "cat-orange" },
  "Advanced Graphs": { icon: "🚀", cat: "cat-pink" },
  "Graphs": { icon: "🕸️", cat: "cat-blue" },
  "1-D Dynamic Programming": { icon: "🧠", cat: "cat-purple" },
  "2-D Dynamic Programming": { icon: "🎮", cat: "cat-green" },
  "Bit Manipulation": { icon: "👾", cat: "cat-orange" },
  "Math & Geometry": { icon: "📐", cat: "cat-blue" },
};

const TOPIC_POSITIONS = {
  "Arrays & Hashing": { x: 600, y: 0 },
  "Two Pointers": { x: 200, y: 350 },
  "Stack": { x: 1000, y: 350 },
  "Binary Search": { x: -200, y: 700 },
  "Sliding Window": { x: 200, y: 700 },
  "Linked List": { x: 600, y: 700 },
  "Trees": { x: 200, y: 1050 },
  "Tries": { x: -200, y: 1400 },
  "Heap / Priority Queue": { x: 200, y: 1400 },
  "Backtracking": { x: 600, y: 1400 },
  "Intervals": { x: -200, y: 1750 },
  "Greedy": { x: 200, y: 1750 },
  "Advanced Graphs": { x: 400, y: 2100 },
  "Graphs": { x: 600, y: 1750 },
  "1-D Dynamic Programming": { x: 1000, y: 1750 },
  "2-D Dynamic Programming": { x: 800, y: 2100 },
  "Bit Manipulation": { x: 1200, y: 2100 },
  "Math & Geometry": { x: 1000, y: 2450 },
};

const TOPIC_EDGES = [
  { source: "Arrays & Hashing", target: "Two Pointers" },
  { source: "Arrays & Hashing", target: "Stack" },
  { source: "Two Pointers", target: "Binary Search" },
  { source: "Two Pointers", target: "Sliding Window" },
  { source: "Two Pointers", target: "Linked List" },
  { source: "Binary Search", target: "Trees" },
  { source: "Sliding Window", target: "Trees" },
  { source: "Linked List", target: "Trees" },
  { source: "Trees", target: "Tries" },
  { source: "Trees", target: "Heap / Priority Queue" },
  { source: "Trees", target: "Backtracking" },
  { source: "Heap / Priority Queue", target: "Intervals" },
  { source: "Heap / Priority Queue", target: "Greedy" },
  { source: "Heap / Priority Queue", target: "Advanced Graphs" },
  { source: "Backtracking", target: "Graphs" },
  { source: "Backtracking", target: "1-D Dynamic Programming" },
  { source: "Graphs", target: "Advanced Graphs" },
  { source: "Graphs", target: "2-D Dynamic Programming" },
  { source: "1-D Dynamic Programming", target: "2-D Dynamic Programming" },
  { source: "1-D Dynamic Programming", target: "Bit Manipulation" },
  { source: "2-D Dynamic Programming", target: "Math & Geometry" },
  { source: "Bit Manipulation", target: "Math & Geometry" },
];

const TopicNode = ({ data }) => {
  const { topic, completedCount, totalCount, onClick } = data;
  const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const meta = TOPIC_METADATA[topic] || { icon: "⚡", cat: "cat-green" };

  return (
    <div className={`topic-node ${meta.cat}`} onClick={() => onClick(topic)}>
      <Handle type="target" position={Position.Top} style={{ background: '#000', border: '3px solid #000', width: 14, height: 14, borderRadius: 0 }} />
      <div className="topic-node-header">
        <span className="topic-node-icon">{meta.icon}</span>
        <span className="topic-node-title">{topic}</span>
      </div>
      <div className="topic-node-stats">
        <span>{pct}% done</span>
        <span>{completedCount} / {totalCount}</span>
      </div>
      <div className="topic-progress-bg">
        <div className="topic-progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <Handle type="source" position={Position.Bottom} style={{ background: '#000', border: '3px solid #000', width: 14, height: 14, borderRadius: 0 }} />
    </div>
  );
};

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [userStatuses, setUserStatuses] = useState({});
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [hoveredNode, setHoveredNode] = useState(null);

  const nodeTypes = useMemo(() => ({ topicNode: TopicNode }), []);

  useEffect(() => {
    async function fetchStatuses() {
      try {
        const statuses = await getEel().get_vault_statuses()();
        if (statuses) setUserStatuses(statuses);
      } catch (e) {
        console.error("Failed to fetch statuses:", e);
      }
    }
    fetchStatuses();
  }, []);

  const handleTopicClick = useCallback((topicName) => {
    setSelectedTopic(topicName);
  }, []);

  const handleToggleProblem = async (problemTitle, topicName) => {
    const currentStatus = userStatuses[problemTitle] || 'Incomplete';
    try {
      const newStatus = await getEel().toggle_question_status()(problemTitle, topicName, currentStatus);
      
      setUserStatuses((prev) => ({
        ...prev,
        [problemTitle]: newStatus,
      }));

      // Trigger Celebration Banner if marking as Completed!
      if (newStatus === 'Completed') {
        setShowCelebration(true);
      }
    } catch (e) {
      console.error("Failed to toggle status:", e);
    }
  };

  useEffect(() => {
    const newNodes = NEETCODE_DATA.map((t) => {
      const pos = TOPIC_POSITIONS[t.topic] || { x: 300, y: 300 };
      const completedCount = t.problems.filter(
        (p) => userStatuses[p.title] === 'Completed'
      ).length;

      return {
        id: t.topic,
        type: 'topicNode',
        position: pos,
        data: {
          topic: t.topic,
          completedCount,
          totalCount: t.problems.length,
          onClick: handleTopicClick,
        },
      };
    });

    const newEdges = TOPIC_EDGES.map((edge, idx) => {
      // Highlight only outgoing edges when hovering over a node
      const isHighlighted = hoveredNode && edge.source === hoveredNode;
      return {
        id: `e-${idx}`,
        source: edge.source,
        target: edge.target,
        type: 'step', // Use step or straight for neo-brutalism
        animated: isHighlighted,
        style: {
          stroke: isHighlighted ? '#000000' : '#000000',
          strokeWidth: isHighlighted ? 4 : 2,
          opacity: isHighlighted ? 1 : 0.2,
          transition: 'all 0.1s ease',
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isHighlighted ? '#000000' : 'rgba(0,0,0,0.2)',
        },
      };
    });

    setNodes(newNodes);
    setEdges(newEdges);
  }, [userStatuses, handleTopicClick, hoveredNode, setNodes, setEdges]);

  // Total Solved calculation
  const totalProblems = useMemo(() => {
    return NEETCODE_DATA.reduce((acc, t) => acc + t.problems.length, 0);
  }, []);

  const totalCompleted = useMemo(() => {
    return Object.values(userStatuses).filter((s) => s === 'Completed').length;
  }, [userStatuses]);

  const percentage = totalProblems > 0 ? Math.round((totalCompleted / totalProblems) * 100) : 0;

  // Rank Calculation
  const rankName = useMemo(() => {
    if (totalCompleted >= 100) return "NEETCODE LEGEND";
    if (totalCompleted >= 50) return "DYNAMIC MASTER";
    if (totalCompleted >= 25) return "ALGO NINJA";
    if (totalCompleted >= 10) return "SAVING ROOKIE";
    return "CODE NOOB";
  }, [totalCompleted]);

  const activeTopicData = useMemo(() => {
    if (!selectedTopic) return null;
    return NEETCODE_DATA.find((t) => t.topic === selectedTopic);
  }, [selectedTopic]);

  const activeMeta = selectedTopic ? (TOPIC_METADATA[selectedTopic] || { icon: "⚡" }) : { icon: "⚡" };

  return (
    <div className="app-container">
      {/* Top Header Dashboard */}
      <div className="app-header">
        <div className="brand-section">
          <div className="brand-icon">⚡</div>
          <div className="brand-logo">LEETMAP</div>
        </div>

        <div className="dashboard-card">
          <div className="rank-badge">
            <div className="rank-title">CURRENT LEVEL</div>
            <div className="rank-name">{rankName}</div>
          </div>

          <div className="gauge-container">
            <svg className="gauge-svg" viewBox="0 0 54 54">
              <circle className="gauge-bg" cx="27" cy="27" r="23" />
              <circle
                className="gauge-fill"
                cx="27"
                cy="27"
                r="23"
                style={{ strokeDashoffset: 144 - (144 * percentage) / 100 }}
              />
            </svg>
            <div className="gauge-text">{percentage}%</div>
          </div>

          <button className="pill-btn pill-btn-blue" onClick={() => setSelectedTopic("Arrays & Hashing")}>
            START HUSTLE 🚀
          </button>
        </div>
      </div>

      {/* Main Interactive Flow Graph */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeMouseEnter={(_, node) => setHoveredNode(node.id)}
        onNodeMouseLeave={() => setHoveredNode(null)}
        nodeTypes={nodeTypes}
        nodesDraggable={false}
        panOnScroll={true}
        fitView
        fitViewOptions={{ padding: 0.15 }}
      >
        <Controls />
        <MiniMap nodeColor="#000" maskColor="rgba(244, 232, 193, 0.75)" />
        <Background variant="dots" gap={24} size={2} color="#000" />
      </ReactFlow>

      {/* Question Modal Drawer */}
      {selectedTopic && activeTopicData && (
        <div className="modal-overlay" onClick={() => setSelectedTopic(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-left">
                <div className="modal-header-icon">{activeMeta.icon}</div>
                <div>
                  <div className="modal-title">{activeTopicData.topic}</div>
                  <div className="modal-subtitle">
                    {activeTopicData.problems.filter((p) => userStatuses[p.title] === 'Completed').length} / {activeTopicData.problems.length} COMPLETED
                  </div>
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedTopic(null)}>
                &times;
              </button>
            </div>

            <div className="modal-body">
              {activeTopicData.problems.map((prob) => {
                const isCompleted = userStatuses[prob.title] === 'Completed';

                return (
                  <div key={prob.title} className="quest-item">
                    <div className="quest-left">
                      <button
                        className={`quest-check ${isCompleted ? 'completed' : ''}`}
                        onClick={() => handleToggleProblem(prob.title, activeTopicData.topic)}
                      >
                        ✓
                      </button>
                      <span className={`quest-title ${isCompleted ? 'completed' : ''}`}>
                        {prob.title}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span className={`quest-badge ${prob.difficulty.toLowerCase()}`}>
                        {prob.difficulty}
                      </span>

                      <a
                        href={prob.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="solve-btn"
                      >
                        SOLVE ↗
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* CELEBRATION POPUP ("YOU DID IT!") */}
      {showCelebration && (
        <div className="celebration-overlay" onClick={() => setShowCelebration(false)}>
          <div className="celebration-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 50, marginBottom: 10 }}>🎉 ✨ 🏆</div>
            <div className="celebration-title">Great Job!</div>
            <div className="celebration-text">
              Problem completed & synced to your Obsidian Vault!
            </div>
            <button className="celebration-btn" onClick={() => setShowCelebration(false)}>
              Keep Going →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
