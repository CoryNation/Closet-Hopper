'use client'

import { motion } from 'framer-motion'

const benefits = [
  {
    icon: '⏰',
    title: 'Save hundreds of hours',
    description: 'Stop retyping listings. Export once, use everywhere.',
  },
  {
    icon: '💰',
    title: 'No SaaS trap',
    description: 'One-time fee, unlimited use. No monthly subscriptions.',
  },
  {
    icon: '🔒',
    title: 'Your data stays yours',
    description: 'Local-first processing. We never store your listings.',
  },
  {
    icon: '🎯',
    title: 'Assistive, not a bot',
    description: 'You stay in control. Review everything before publishing.',
  }
]

export default function WhyClosetHopper() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Why Closet Hopper?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Built by resellers, for resellers. We understand your pain points.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="card text-center"
            >
              <div className="text-4xl mb-4">{benefit.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {benefit.title}
              </h3>
              <p className="text-gray-600">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
