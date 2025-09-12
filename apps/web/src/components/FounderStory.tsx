'use client'

import { motion } from 'framer-motion'

export default function FounderStory() {
  return (
    <section id="founder-story" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              My Story: eBay Frustration turned into Closet Freedom
            </h2>
            <div className="w-24 h-1 bg-poshmark-pink mx-auto rounded-full"></div>
          </div>

          <div className="prose prose-lg max-w-none">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-8 md:p-12 shadow-lg mb-8"
            >
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                For over <strong className="text-poshmark-pink">15 years</strong>, I was a <strong className="text-poshmark-pink">Top Rated Seller on eBay</strong>. I sold 10,000s of items, built a loyal buyer base, and took pride in my work. Then, almost overnight, everything changed.
              </p>

              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                (Tell me if this sounds familiar) It started with <strong className="text-poshmark-pink">3 abusive/scam buyers</strong> claiming items not received (including a replacement), false condition reports, even returns of items I never sold. I followed every policy, appealed every case and eventually eBay
                sided with me... but not before my <strong className="text-poshmark-pink">seller metrics were impacted</strong>.
              </p>

              <p className="text-gray-700 text-lg leading-relaxed mb-4">Those broken metrics triggered a downward spiral lasting 4 months:</p>
              <ul className="space-y-3 mb-6">
                <li><strong>Thousands of my listings were removed</strong></li>
                <li><strong>Listing ability was restricted</strong></li>
                <li><strong>Fees increased</strong></li>
                <li>
                  Customer support never addressed my concerns—chats ended with:
                  “it seems we're going in a loop”, then they’d end the conversation
                </li>
              </ul>

              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                Researching further, I discovered I wasn't alone—there was a <strong className="text-poshmark-pink">mass exodus of sellers</strong> leaving eBay for alternatives. I found (and loved) <strong className="text-poshmark-pink">Poshmark</strong>—the community, the focus on closets, the fresh energy. But I
                didn't want to throw away years of work by rebuilding thousands of <em className="text-gray-600">titles, photos, and descriptions</em> from scratch.
              </p>

              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Why I Built Closet Hopper
              </h3>
              
              <p className="text-gray-700 text-lg leading-relaxed mb-4">
                <strong className="text-poshmark-pink">Closet Hopper</strong> lets you keep the work you've already done:
              </p>
              
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <span className="text-poshmark-pink mr-3 mt-1">•</span>
                  <span className="text-gray-700"><strong className="text-poshmark-pink">Download your eBay listings</strong>—active, drafts, unsold, and more</span>
                </li>
                <li className="flex items-start">
                  <span className="text-poshmark-pink mr-3 mt-1">•</span>
                  <span className="text-gray-700"><strong className="text-poshmark-pink">Individually upload to your Poshmark closet</strong> with details and photos intact</span>
                </li>
                <li className="flex items-start">
                  <span className="text-poshmark-pink mr-3 mt-1">•</span>
                  <span className="text-gray-700"><strong className="text-poshmark-pink">Save hours</strong> otherwise spent retyping and re-uploading</span>
                </li>
              </ul>

            </motion.div>


            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
              className="bg-gradient-to-r from-poshmark-pink to-pink-500 rounded-2xl p-8 md:p-12 text-white text-center"
            >
              <h3 className="text-2xl font-bold mb-6">Ready to Make the Switch?</h3>
              <p className="text-lg leading-relaxed mb-6">
                This isn't a spam-bot. Closet Hopper is <strong>assistive</strong>, not fully automated—you stay in control of every listing. We respect platform rules and keep quality high while dramatically reducing the grunt work.
              </p>
              <p className="text-lg leading-relaxed">
                <strong>Closet Hopper is the bridge I needed when eBay made selling unsustainable.</strong> Now it's here to help you say goodbye to eBay headaches—and <strong>hop your closet</strong> into a better home.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
