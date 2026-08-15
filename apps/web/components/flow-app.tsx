"use client";

import { ChangeEvent, useMemo, useRef, useState } from "react";
import { Bracelet } from "./bracelet";
import { catalog, clusterImages, demoBazi, elementMascots, type Crystal } from "../lib/data";

type BirthForm = { name: string; calendar: "solar" | "lunar"; year: string; month: string; day: string; hour: string; minute: string; unknownTime: boolean; gender: "男" | "女" };
const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

const years = Array.from({ length: 107 }, (_, i) => String(2026 - i));
const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
const days = Array.from({ length: 30 }, (_, i) => String(i + 1).padStart(2, "0"));
const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const lunarHours = ["子时", "丑时", "寅时", "卯时", "辰时", "巳时", "午时", "未时", "申时", "酉时", "戌时", "亥时"];

export function FlowApp() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<BirthForm>({ name: "", calendar: "solar", year: "1995", month: "08", day: "16", hour: "14", minute: "30", unknownTime: false, gender: "女" });
  const [variant, setVariant] = useState(0);
  const [mode, setMode] = useState<"solid" | "mix">("solid");
  const [mainCrystal, setMainCrystal] = useState<Crystal>(catalog.土[0]);
  const [secondaryCrystal, setSecondaryCrystal] = useState<Crystal | undefined>();
  const [customReady, setCustomReady] = useState(false);
  const [origin, setOrigin] = useState<4 | 6>(4);
  const [photo, setPhoto] = useState<string>();
  const [previewReady, setPreviewReady] = useState(false);
  const touchStart = useRef<number | null>(null);

  const recommended = useMemo(() => [
    { title: "素色守护款", main: catalog.土[0], effect: "黄水晶以土性色调为主，用于承接命局所需的稳定感，帮助收束分散精力，把当前目标落实到持续行动中。" },
    { title: "拼色平衡款", main: catalog.土[0], secondary: catalog.火[6], effect: "土性黄水晶承接主方向，火性紫水晶作为辅助激发，以稳中有动的节奏补足行动力，同时避免过度躁进。" },
    { title: "主题点睛款", main: catalog.火[6], secondary: catalog.木[0], effect: "紫水晶提供向外的推进感，绿幽灵作为节奏调节，适合需要启动新计划、又需保持边界和耐心的阶段。" },
  ], []);
  const shown = customReady ? { title: mode === "solid" ? "自选素色款" : "自选拼色款", main: mainCrystal, secondary: mode === "mix" ? secondaryCrystal : undefined, effect: mode === "solid" ? recommended[0].effect : recommended[1].effect } : recommended[variant];

  async function submitBirth() {
    try {
      const recordResponse = await fetch(`${API}/v1/records`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!recordResponse.ok) throw new Error("出生信息保存失败");
      const record = await recordResponse.json() as { id: string };
      const analysisResponse = await fetch(`${API}/v1/analyses`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ record_id: record.id }) });
      if (!analysisResponse.ok) throw new Error("命理分析任务创建失败");
    } catch {
      // 本地后端未启动时仍允许继续浏览原型；正式部署会改为阻断并提示。
    }
    setStep(3);
  }

  function chooseCrystal(crystal: Crystal) {
    if (mode === "solid") setMainCrystal(crystal);
    else if (crystal.element === "土") setMainCrystal(crystal);
    else setSecondaryCrystal(crystal);
  }

  function handlePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (photo) URL.revokeObjectURL(photo);
    setPhoto(URL.createObjectURL(file));
    setPreviewReady(false);
  }

  return (
    <main className="shell">
      <section className="phone">
        <div className="screen">
          <header className="topbar">
            {step > 1 ? <button className="back" onClick={() => setStep((value) => Math.max(1, value - 1))} aria-label="返回">‹</button> : <span />}
            <span className="progress">{String(step).padStart(2, "0")} / 08</span>
          </header>

          {step === 1 && <HomeScreen onStart={() => setStep(2)} />}
          {step === 2 && <InfoScreen form={form} setForm={setForm} onNext={submitBirth} />}
          {step === 3 && <ConfirmScreen form={form} onBack={() => setStep(2)} onNext={() => setStep(4)} />}
          {step === 4 && (
            <section className="page-content">
              <Hero title={"适合你的\n三种手串"} mascot={elementMascots.土} />
              <div onTouchStart={(e) => touchStart.current = e.touches[0].clientX} onTouchEnd={(e) => { if (touchStart.current === null) return; const distance = e.changedTouches[0].clientX - touchStart.current; if (Math.abs(distance) > 45) setVariant((variant + (distance < 0 ? 1 : 2)) % 3); touchStart.current = null; }}>
                <Bracelet primary={shown.main} secondary={shown.secondary} slow />
              </div>
              <div className="dots">{recommended.map((_, i) => <button key={i} aria-label={`第 ${i + 1} 款`} className={i === variant ? "active" : ""} onClick={() => setVariant(i)} />)}</div>
              <ResultCard title={shown.title} main={shown.main} secondary={shown.secondary} effect={shown.effect}>
                <button className="primary" onClick={() => { setOrigin(4); setCustomReady(false); setStep(7); }}>我喜欢这款</button>
                <button className="secondary" onClick={() => setStep(5)}>我想自己挑选水晶</button>
              </ResultCard>
            </section>
          )}
          {step === 5 && <PickerScreen mode={mode} setMode={setMode} main={mainCrystal} secondary={secondaryCrystal} choose={chooseCrystal} onNext={() => { setCustomReady(true); setStep(6); }} />}
          {step === 6 && (
            <section className="page-content">
              <Hero title="您的眼光很特别呢" mascot={elementMascots.土} />
              <Bracelet primary={mainCrystal} secondary={mode === "mix" ? secondaryCrystal : undefined} slow />
              <ResultCard title={mode === "solid" ? "自选素色款" : "自选拼色款"} badge="自选" heading="手串说明" main={mainCrystal} secondary={mode === "mix" ? secondaryCrystal : undefined} effect={shown.effect}>
                <button className="primary" onClick={() => { setOrigin(6); setStep(7); }}>看看穿戴效果</button>
                <button className="secondary" onClick={() => setStep(5)}>重新选择</button>
              </ResultCard>
            </section>
          )}
          {step === 7 && <TryOnScreen photo={photo} previewReady={previewReady} main={shown.main} secondary={shown.secondary} onPhoto={handlePhoto} onGenerate={() => setPreviewReady(true)} onNext={() => setStep(8)} onReselect={() => setStep(origin)} />}
          {step === 8 && <ClusterScreen />}
        </div>
      </section>
      <p className="dev-note">本地开发版 · 命理内容为演示数据，正式排盘口径确认后接入</p>
    </main>
  );
}

function HomeScreen({ onStart }: { onStart: () => void }) {
  return <section className="home page-content"><Hero title={"找到此刻\n适合你的水晶"} /><div className="orb-stage"><div className="orb" />{(["金", "木", "水", "火", "土"] as const).map((key) => <img key={key} className={`home-mascot mascot-${key}`} src={elementMascots[key]} alt={`${key}元素形象`} />)}</div><button className="primary home-start" onClick={onStart}>开始</button></section>;
}

function Hero({ title, mascot }: { title: string; mascot?: string }) {
  return <div className="hero"><h1>{title.split("\n").map((line) => <span key={line}>{line}</span>)}</h1>{mascot && <img className="hero-mascot" src={mascot} alt="" />}</div>;
}

function InfoScreen({ form, setForm, onNext }: { form: BirthForm; setForm: (form: BirthForm) => void; onNext: () => void }) {
  const update = (patch: Partial<BirthForm>) => setForm({ ...form, ...patch });
  return <section className="page-content"><Hero title="填写您的信息" mascot={elementMascots.水} />
    <div className="segmented"><button className={form.calendar === "solar" ? "selected" : ""} onClick={() => update({ calendar: "solar", hour: "14", minute: "30" })}>阳历</button><button className={form.calendar === "lunar" ? "selected" : ""} onClick={() => update({ calendar: "lunar", hour: "未时", minute: "" })}>农历</button></div>
    <div className="form-stack">
      <label className="field accent-green"><span>您的称呼 · 必填</span><input value={form.name} onChange={(e) => update({ name: e.target.value })} placeholder="请输入您的称呼" /></label>
      <div className="field accent-gold"><span>出生日期 · 必填</span><div className="select-row"><Select value={form.year} values={years} onChange={(year) => update({ year })} suffix="年"/><Select value={form.month} values={months} onChange={(month) => update({ month })} suffix="月"/><Select value={form.day} values={days} onChange={(day) => update({ day })} suffix="日"/></div></div>
      <div className="field accent-red"><span>出生时辰 · 选填</span><div className="time-row">{form.calendar === "lunar" ? <select value={form.hour} onChange={(e) => update({ hour: e.target.value, unknownTime: false })}>{lunarHours.map((value) => <option key={value}>{value}</option>)}</select> : <><Select value={form.hour} values={hours} onChange={(hour) => update({ hour, unknownTime: false })} suffix="时"/><Select value={form.minute} values={["00", "30"]} onChange={(minute) => update({ minute, unknownTime: false })} suffix="分"/></>}<button className={form.unknownTime ? "time-unknown selected" : "time-unknown"} onClick={() => update({ unknownTime: !form.unknownTime })}>不知道时辰</button></div></div>
      <div className="field accent-purple"><span>性别 · 必填</span><div className="gender"><button className={form.gender === "男" ? "selected" : ""} onClick={() => update({ gender: "男" })}>男</button><button className={form.gender === "女" ? "selected" : ""} onClick={() => update({ gender: "女" })}>女</button></div></div>
    </div><button disabled={!form.name.trim()} className="primary" onClick={onNext}>确认并开始排盘</button>
  </section>;
}

function Select({ value, values, suffix, onChange }: { value: string; values: string[]; suffix: string; onChange: (value: string) => void }) {
  return <label className="inline-select"><select value={value} onChange={(e) => onChange(e.target.value)}>{values.map((item) => <option key={item} value={item}>{item}</option>)}</select><b>{suffix}</b></label>;
}

function ConfirmScreen({ form, onBack, onNext }: { form: BirthForm; onBack: () => void; onNext: () => void }) {
  return <section className="page-content"><Hero title="确认您的信息" mascot={elementMascots.金} /><div className="glass-panel"><div className="info-card"><h3>您的称呼与出生信息</h3><dl><dt>称呼</dt><dd>{form.name}</dd><dt>生日</dt><dd>{form.year} 年 {form.month} 月 {form.day} 日 {!form.unknownTime && `${form.hour}:${form.minute}`}</dd><dt>性别</dt><dd>{form.gender}</dd></dl></div><div className="bazi-card"><h3>八字信息</h3><div className="bazi-grid">{demoBazi.map((item) => <div className="pillar" key={item.name}><b>{item.name}</b><div><strong>{item.stem}</strong><small>{item.name === "日柱" ? (form.gender === "男" ? "乾造" : "坤造") : item.stemGod}</small></div><div><strong>{item.branch}</strong><small>{item.branchGod}</small></div></div>)}</div></div><div className="fortune-card"><h3>当前运势</h3><div className="fortune-grid"><div><span>当前大运</span><b>丁亥</b><small>丁 · 正印<br/>亥 · 偏财</small></div><div><span>当前流年</span><b>丙午</b><small>丙 · 偏印<br/>午 · 正印</small></div></div></div><button className="primary" onClick={onNext}>了解 去看适合我的手串</button><button className="text-button" onClick={onBack}>返回修改出生信息</button></div></section>;
}

function ResultCard({ title, badge = "推荐", heading = "推荐说明", main, secondary, effect, children }: { title: string; badge?: string; heading?: string; main: Crystal; secondary?: Crystal; effect: string; children: React.ReactNode }) {
  return <div className="result-card"><div className="result-title"><div><h2>{title}</h2><span className="title-mascots"><img src={elementMascots[main.element]} alt="" />{secondary && <img src={elementMascots[secondary.element]} alt="" />}</span></div><em>{badge}</em></div><h3>{heading}</h3><div className="recommend-scroll"><p><b>水晶组成</b><span>{main.name} {secondary ? `12 颗 + ${secondary.name} 10 颗` : "22 颗"}</span></p><p><b>对命主作用</b><span>{effect}</span></p></div><div className="card-actions">{children}</div></div>;
}

function PickerScreen({ mode, setMode, main, secondary, choose, onNext }: { mode: "solid" | "mix"; setMode: (mode: "solid" | "mix") => void; main: Crystal; secondary?: Crystal; choose: (c: Crystal) => void; onNext: () => void }) {
  const crystals = mode === "solid" ? catalog.土 : [...catalog.土, ...catalog.火];
  return <section className="page-content"><Hero title={"挑一两种\n你喜欢的水晶"} mascot={elementMascots.木} /><div className="segmented"><button className={mode === "solid" ? "selected purple" : ""} onClick={() => setMode("solid")}>素串</button><button className={mode === "mix" ? "selected purple" : ""} onClick={() => setMode("mix")}>拼色</button></div>{mode === "mix" && <div className="element-tabs"><span><img src={elementMascots.土} alt=""/>主水晶 · 土色系</span><span><img src={elementMascots.火} alt=""/>辅助水晶 · 火色系</span></div>}<div className="crystal-grid">{crystals.map((crystal) => { const selected = crystal.id === main.id || crystal.id === secondary?.id; return <button className={selected ? "crystal selected" : "crystal"} key={crystal.id} onClick={() => choose(crystal)}><img src={crystal.image} alt={crystal.name}/><b>{crystal.name}</b><small>{crystal.element}</small>{selected && <i>✓</i>}</button>; })}</div><div className="selection-card"><h2>已选水晶</h2><div><Selection crystal={main} title="主水晶"/><Selection crystal={mode === "mix" ? secondary : undefined} title="辅助水晶"/></div><button className="primary" disabled={mode === "mix" && !secondary} onClick={onNext}>生成我的手串</button></div></section>;
}

function Selection({ crystal, title }: { crystal?: Crystal; title: string }) { return <div className={crystal ? "selection" : "selection empty"}>{crystal && <img src={crystal.image} alt=""/>}<p><b>{title}</b><small>{crystal?.name ?? "尚未选择"}</small></p></div>; }

function TryOnScreen({ photo, previewReady, main, secondary, onPhoto, onGenerate, onNext, onReselect }: { photo?: string; previewReady: boolean; main: Crystal; secondary?: Crystal; onPhoto: (e: ChangeEvent<HTMLInputElement>) => void; onGenerate: () => void; onNext: () => void; onReselect: () => void }) {
  return <section className="page-content"><Hero title="看看穿戴效果" mascot={elementMascots.土}/><p className="subcopy">上传一张露手腕照片，生成视觉参考。</p><label className="upload"><input type="file" accept="image/png,image/jpeg,image/heic" onChange={onPhoto}/><span className="upload-icon">⌁</span><b>{photo ? "已选择图片" : "点击上传露手腕照片"}</b><small>JPG / PNG / HEIC · 短边不少于 720px</small></label>{photo && <button className="primary" onClick={onGenerate}>{previewReady ? "重新生成效果图" : "生成效果图"}</button>}{previewReady && photo && <div className="wrist-preview"><img src={photo} alt="用户上传的露手腕照片"/><div className="tryon-bracelet"><Bracelet primary={main} secondary={secondary} /></div><span>效果图演示</span></div>}<div className="tryon-actions"><button className="primary" onClick={onNext}>很满意 去看水晶簇</button><button className="secondary" onClick={onReselect}>我想重新挑选</button></div></section>;
}

function ClusterScreen() {
  const [tab, setTab] = useState(0);
  return <section className="page-content"><Hero title={"给这一段生活\n留一处陪伴"} mascot={elementMascots.火}/><div className="cluster-image"><img src={clusterImages[tab]} alt="水晶簇产品场景图"/></div><div className="cluster-tabs">{["工作 / 学习", "居家休息", "自然空间"].map((name, i) => <button className={tab === i ? "selected" : ""} key={name} onClick={() => setTab(i)}>{name}</button>)}</div><div className="result-card cluster-copy"><div className="result-title"><div><h2>紫晶簇 · 稳定积累</h2></div></div><h3>推荐主题</h3><p>为专注、资源积累和安静推进留出一处视觉锚点。</p><blockquote>愿它在身边替你留住清醒与专注，让每一次投入都有回响，计划稳稳向前。</blockquote></div></section>;
}
