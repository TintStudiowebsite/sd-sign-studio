const steps = [
  {
    num: '01',
    title: 'Consultation & Design',
    desc: 'We start by understanding your brand, goals, and target audience. Our creative team develops custom, eye-catching concepts tailored to your exact vehicle dimensions or storefront layout, ensuring maximum impact before we even touch a printer.',
    img: '/images/workflow/consultation.png',
  },
  {
    num: '02',
    title: 'Precision Printing',
    desc: 'Using state-of-the-art wide format printers and premium 3M and Avery Dennison vinyls, we bring the digital designs to life. We guarantee vibrant, fade-resistant colors that will withstand the harsh Scottish weather.',
    img: '/images/workflow/precision-printing.png',
  },
  {
    num: '03',
    title: 'Expert Installation',
    desc: 'Our certified installers meticulously apply the vinyl in our climate-controlled Glasgow studio. We pay obsessive attention to edges, curves, and seams, delivering a flawless, paint-like finish every single time.',
    img: '/images/workflow/expert-installation.png',
  },
]

export default function ProcessSection() {
  return (
    <section className="process-section" id="process">
      <div className="process-inner">
        <div className="section-header process-header">
          <span className="section-eyebrow">Our Workflow</span>
          <h2 className="section-title">The SD Sign <span className="red">Process</span></h2>
        </div>
        <div className="process-steps-list">
          {steps.map((step, i) => (
            <div className="process-step" key={i}>
              <div className="process-img-wrap">
                <img className="process-img" src={step.img} alt={step.title} loading="lazy" />
                <span className="step-badge-overlay">Step {step.num}</span>
              </div>
              <div className="process-step-content">
                <div className="step-number">{step.num}</div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-desc">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

