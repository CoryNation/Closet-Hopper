'use client'

import { motion } from 'framer-motion'

const steps = [
  {
    number: '1',
    title: 'Download & Install',
    description: 'Download our desktop app and Chrome extension (one-click install)',
    icon: '📥'
  },
  {
    number: '2',
    title: 'Export your eBay listings',
    description: 'Enter your eBay username and click export - we handle the rest',
    icon: '📤'
  },
  {
    number: '3',
    title: 'Drag & Drop to Poshmark',
    description: 'Go to Poshmark\'s create listing page and drag your exported folder',
    icon: '🖱️'
  },
  {
    number: '4',
    title: 'Review & Publish',
    description: 'ClosetHopper fills everything in - you just review and publish',
    icon: '✅'
  }
]

export default function HowItWorks() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Four simple steps to migrate your entire closet
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="bg-coral/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">{step.icon}</span>
              </div>
              <div className="bg-coral text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-4 text-sm font-bold">
                {step.number}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {step.title}
              </h3>
              <p className="text-gray-600">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
