import React, { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const Contact = () => {
  const sectionRef = useRef(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const section = sectionRef.current
    const elements = section.querySelectorAll('.animate-on-scroll')

    elements.forEach((element, index) => {
      gsap.from(element, {
        scrollTrigger: {
          trigger: element,
          start: "top bottom-=100",
          toggleActions: "play none none reverse"
        },
        y: 50,
        opacity: 0,
        duration: 0.8,
        delay: index * 0.2
      })
    })
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Reset form
    setFormData({ name: '', email: '', message: '' })
    setIsSubmitting(false)
    
    // Show success message
    alert('Thank you for your message! We will get back to you soon.')
  }

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <section ref={sectionRef} className="py-20 bg-black/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-16 text-center animate-on-scroll">
          Get in <span className="text-yellow-300">Touch</span>
        </h2>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Contact Info */}
          <div className="space-y-8 animate-on-scroll">
            <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4">Contact Information</h3>
              <div className="space-y-4">
                <p className="flex items-center text-white/70">
                  <span className="mr-3">📍</span>
                  123 Creative Street, Digital City
                </p>
                <p className="flex items-center text-white/70">
                  <span className="mr-3">📧</span>
                  contact@penguverse.com
                </p>
                <p className="flex items-center text-white/70">
                  <span className="mr-3">📱</span>
                  +1 (555) 123-4567
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4">Follow Us</h3>
              <div className="flex gap-4">
                {['Twitter', 'Instagram', 'LinkedIn'].map(social => (
                  <a
                    key={social}
                    href="#"
                    className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-yellow-300 hover:text-black transition-all duration-300"
                  >
                    {social === 'Twitter' ? '𝕏' : social[0]}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <form onSubmit={handleSubmit} className="space-y-6 animate-on-scroll">
            <div>
              <label htmlFor="name" className="block text-white mb-2">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:border-yellow-300 focus:outline-none transition-colors duration-300"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-white mb-2">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:border-yellow-300 focus:outline-none transition-colors duration-300"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-white mb-2">Message</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows="4"
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:border-yellow-300 focus:outline-none transition-colors duration-300"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-8 py-3 bg-yellow-300 text-black rounded-full font-medium text-lg hover:bg-yellow-400 transition-colors duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}

export default Contact 