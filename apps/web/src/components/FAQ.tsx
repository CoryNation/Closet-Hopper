'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'

const faqs = [
  {
    question: "Why one-time fee?",
    answer: "Because this tool has a single job: get you out of eBay. No recurring costs, no subscription traps. Pay once, use forever."
  },
  {
    question: "Can I use it on multiple browsers?",
    answer: "One license per browser profile. If you need to use it on multiple browsers, you'll need additional licenses."
  },
  {
    question: "Is this safe?",
    answer: "Yes, data is stored locally on your computer. We never store your listings or personal information. Everything stays on your device."
  },
  {
    question: "What if Poshmark changes its form?",
    answer: "We patch updates quickly and you'll get v1.x updates free. We monitor Poshmark's changes and update the extension accordingly."
  },
  {
    question: "How many listings can I export?",
    answer: "Unlimited! Export as many eBay listings as you want. The only limit is your eBay account's listing count."
  },
  {
    question: "Do I need eBay API access?",
    answer: "No! We use web scraping, so you don't need to set up any eBay API credentials. Just run the export tool with your eBay username."
  }
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

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
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to know about ClosetHopper
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="card mb-4"
            >
              <button
                className="w-full text-left flex justify-between items-center"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <h3 className="text-lg font-semibold text-gray-900 pr-4">
                  {faq.question}
                </h3>
                <span className="text-coral text-xl">
                  {openIndex === index ? '−' : '+'}
                </span>
              </button>
              
              {openIndex === index && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 pt-4 border-t border-gray-100"
                >
                  <p className="text-gray-600">{faq.answer}</p>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
