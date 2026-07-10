import React from "react";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  CartesianGrid 
} from "recharts";
import { Award, Briefcase, Globe, GraduationCap, TrendingUp, Users } from "lucide-react";

export default function Analytics({ mockAlumni }) {
  // Aggregate statistics
  const approvedAlumni = mockAlumni.filter(a => a.status === "approved");
  const totalAlumni = approvedAlumni.length;
  
  const verifiedAlumni = approvedAlumni.filter(a => a.verified).length;
  const verifiedPercentage = totalAlumni > 0 ? Math.round((verifiedAlumni / totalAlumni) * 100) : 0;
  
  const availableMentors = approvedAlumni.filter(a => a.mentor_available).length;
  
  const employedCount = approvedAlumni.filter(a => a.current_company).length;
  const employmentRate = totalAlumni > 0 ? Math.round((employedCount / totalAlumni) * 100) : 0;

  // 1. Department Distribution Data
  const deptMap = {};
  approvedAlumni.forEach(a => {
    deptMap[a.department] = (deptMap[a.department] || 0) + 1;
  });
  const deptData = Object.keys(deptMap).map(dept => ({
    name: dept,
    value: deptMap[dept]
  })).sort((a, b) => b.value - a.value);

  // 2. Top Hiring Companies Data
  const companyMap = {};
  approvedAlumni.forEach(a => {
    if (a.current_company) {
      companyMap[a.current_company] = (companyMap[a.current_company] || 0) + 1;
    }
  });
  const companyData = Object.keys(companyMap).map(comp => ({
    name: comp,
    alumni: companyMap[comp]
  })).sort((a, b) => b.alumni - a.alumni).slice(0, 5);

  // 3. Location (Country) Data
  const countryMap = {};
  approvedAlumni.forEach(a => {
    if (a.location?.country) {
      countryMap[a.location.country] = (countryMap[a.location.country] || 0) + 1;
    }
  });
  const countryData = Object.keys(countryMap).map(c => ({
    name: c,
    count: countryMap[c]
  })).sort((a, b) => b.count - a.count).slice(0, 5);

  // Theme colors
  const COLORS = ["#16233F", "#C08A2E", "#2F7A5C", "#5B6472", "#E3E6EC", "#D4AF37", "#1E4620"];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      
      {/* Analytics Page Header */}
      <header className="border-b border-line pb-4">
        <h1 className="font-display font-bold text-3xl text-ink">Registry Analytics & Insights</h1>
        <p className="font-sans text-xs text-ink-muted mt-1">
          Aggregated placements data, hiring distribution, and engagement metrics.
        </p>
      </header>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric 1 */}
        <div className="bg-surface border border-line p-5 rounded-sm flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider block">Total Registered</span>
            <span className="font-data font-bold text-3xl text-ink">{totalAlumni}</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-ink/5 flex items-center justify-center text-ink">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-surface border border-line p-5 rounded-sm flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider block">Verification Rate</span>
            <span className="font-data font-bold text-3xl text-accent-emerald">{verifiedPercentage}%</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-accent-emerald/5 flex items-center justify-center text-accent-emerald">
            <Award className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-surface border border-line p-5 rounded-sm flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider block">Employed Rate</span>
            <span className="font-data font-bold text-3xl text-ink">{employmentRate}%</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-ink/5 flex items-center justify-center text-ink">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-surface border border-line p-5 rounded-sm flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider block">Available Mentors</span>
            <span className="font-data font-bold text-3xl text-accent-gold">{availableMentors}</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-accent-gold/5 flex items-center justify-center text-accent-gold">
            <GraduationCap className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Department Breakdown Bar Chart */}
        <div className="bg-surface border border-line p-6 rounded-sm space-y-4">
          <h3 className="font-display font-semibold text-lg text-ink">Alumni by Department</h3>
          <p className="font-sans text-xs text-ink-muted leading-relaxed">
            Graduates count enrolled in the alumni network per degree program.
          </p>
          <div className="h-64 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: "#5B6472", fontSize: 10, fontFamily: "IBM Plex Mono" }}
                  axisLine={{ stroke: "#E3E6EC" }}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fill: "#5B6472", fontSize: 10, fontFamily: "IBM Plex Mono" }} 
                  axisLine={{ stroke: "#E3E6EC" }}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{ background: "#FFFFFF", border: "1px solid #E3E6EC", fontSize: 11, fontFamily: "Inter" }}
                  cursor={{ fill: "#F8F9FB" }}
                />
                <Bar dataKey="value" fill="#16233F" radius={[2, 2, 0, 0]}>
                  {deptData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? "#C08A2E" : index === 1 ? "#2F7A5C" : "#16233F"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Employers Chart */}
        <div className="bg-surface border border-line p-6 rounded-sm space-y-4">
          <h3 className="font-display font-semibold text-lg text-ink">Top Hiring Companies</h3>
          <p className="font-sans text-xs text-ink-muted leading-relaxed">
            Leading companies and global tech firms employing NSCET alumni.
          </p>
          <div className="h-64 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={companyData} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <XAxis 
                  type="number"
                  tick={{ fill: "#5B6472", fontSize: 10, fontFamily: "IBM Plex Mono" }}
                  axisLine={{ stroke: "#E3E6EC" }}
                  tickLine={false}
                />
                <YAxis 
                  dataKey="name" 
                  type="category"
                  tick={{ fill: "#16233F", fontSize: 10, fontWeight: "bold" }} 
                  axisLine={{ stroke: "#E3E6EC" }}
                  tickLine={false}
                  width={90}
                />
                <Tooltip 
                  contentStyle={{ background: "#FFFFFF", border: "1px solid #E3E6EC", fontSize: 11 }}
                  cursor={{ fill: "#F8F9FB" }}
                />
                <Bar dataKey="alumni" fill="#2F7A5C" radius={[0, 2, 2, 0]} barSize={16}>
                  {companyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#2F7A5C" : "#16233F"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Global Distribution Table Ledger style */}
        <div className="bg-surface border border-line p-6 rounded-sm space-y-4">
          <h3 className="font-display font-semibold text-lg text-ink">Global Headquarters</h3>
          <p className="font-sans text-xs text-ink-muted leading-relaxed">
            Registry details tracking where graduates relocated to work.
          </p>
          <div className="overflow-x-auto pt-2">
            <table className="w-full text-left font-sans text-xs border-collapse">
              <thead>
                <tr className="border-b border-line text-ink-muted uppercase text-[10px] tracking-wider font-bold">
                  <th className="py-2.5">Region/Country</th>
                  <th className="py-2.5 text-right">Alumni Placed</th>
                  <th className="py-2.5 text-right">Percentage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {countryData.map((c, idx) => {
                  const pct = totalAlumni > 0 ? Math.round((c.count / totalAlumni) * 100) : 0;
                  return (
                    <tr key={idx} className="hover:bg-bg/40">
                      <td className="py-3 font-semibold text-ink flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-accent-emerald" />
                        <span>{c.name}</span>
                      </td>
                      <td className="py-3 text-right font-data font-bold text-ink">{c.count}</td>
                      <td className="py-3 text-right font-data text-accent-gold font-bold">{pct}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Placement Trends Summary */}
        <div className="bg-surface border border-line p-6 rounded-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-display font-semibold text-lg text-ink flex items-center gap-1.5">
              <TrendingUp className="w-5 h-5 text-accent-gold" />
              <span>Registry Insight Summary</span>
            </h3>
            <p className="font-sans text-xs text-ink-muted leading-relaxed mt-2">
              Based on parsing the self-registered graduates records:
            </p>
            <ul className="mt-4 space-y-3 font-sans text-xs text-ink-muted">
              <li className="flex gap-2.5 items-start">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-gold mt-1.5 shrink-0" />
                <span>The <strong className="text-ink">Computer Science (CSE)</strong> division represents the highest enrollment on the registry platform with the fastest signup velocity.</span>
              </li>
              <li className="flex gap-2.5 items-start">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald mt-1.5 shrink-0" />
                <span><strong className="text-ink">USA</strong> and <strong className="text-ink">Singapore</strong> are the top international hubs for post-graduate engineering employment.</span>
              </li>
              <li className="flex gap-2.5 items-start">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald mt-1.5 shrink-0" />
                <span>Over <strong className="text-ink font-data">{verifiedAlumni}</strong> profiles are verified by administration matching graduation logs.</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-bg border border-line p-4 rounded-xs text-[11px] font-sans italic text-ink-muted/80">
            ℹ️ Aggregates update automatically in real-time as pending profiles get approved.
          </div>
        </div>

      </div>

    </div>
  );
}
