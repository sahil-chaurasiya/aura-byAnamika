import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay, Thumbs } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';
import api from '../../services/api';

// Fallback slides matching original template look
const DEFAULT_SLIDES = [
  {
    _id: '1',
    subHeading: 'Perfect for Summer Evenings',
    heading: 'Casual and Stylish for All Seasons',
    pricePrefix: 'Starting From',
    price: '$129',
    buttonText: 'SHOP NOW',
    buttonLink: '/shop',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1125&h=640&fit=crop&crop=top',
    thumbImage: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=450&h=450&fit=crop',
  },
  {
    _id: '2',
    subHeading: 'Perfect for Summer Evenings',
    heading: 'Casual and Stylish for All Seasons',
    pricePrefix: 'Starting From',
    price: '$129',
    buttonText: 'SHOP NOW',
    buttonLink: '/shop',
    image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=1125&h=640&fit=crop&crop=top',
    thumbImage: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=450&h=450&fit=crop',
  },
  {
    _id: '3',
    subHeading: 'Perfect for Summer Evenings',
    heading: 'Casual and Stylish for All Seasons',
    pricePrefix: 'Starting From',
    price: '$129',
    buttonText: 'SHOP NOW',
    buttonLink: '/shop',
    image: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=1125&h=640&fit=crop&crop=top',
    thumbImage: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=450&h=450&fit=crop',
  },
];

export default function HeroSection() {
  const [slides, setSlides] = useState(DEFAULT_SLIDES);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const mainSwiperRef = useRef(null);

  useEffect(() => {
    api.get('/hero')
      .then(r => {
        if (r.data.data?.length) {
          // Reset so the main swiper doesn't briefly bind to a thumbs
          // instance that's about to be torn down and recreated.
          setThumbsSwiper(null);
          setSlides(r.data.data);
        }
      })
      .catch(() => {});
  }, []);

  // Identity of the current slide set. Changing this forces React to fully
  // unmount/remount the Swiper instances (via `key`) instead of patching new
  // slides into an already-initialized loop-mode instance in place, which is
  // what causes misaligned/overlapping clone slides after a data swap.
  const slidesKey = slides.map(s => s._id || s.image).join('|');

  return (
    <div className="overflow-hidden">
      <div className="ul-container">
        {/* .ul-banner uses display:flex with gap — matches original exactly */}
        <section className="ul-banner">

          {/* LEFT: Main slider wrapper */}
          <div className="ul-banner-slider-wrapper">
            <div className="ul-banner-slider">
              <Swiper
                key={`main-${slidesKey}`}
                modules={[Navigation, Autoplay, Thumbs]}
                slidesPerView={1}
                loop
                autoplay={{ delay: 4000, disableOnInteraction: false }}
                thumbs={{
                  swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null,
                }}
                navigation={{
                  nextEl: '.ul-banner-slider-nav .next',
                  prevEl: '.ul-banner-slider-nav .prev',
                }}
                onSwiper={s => { mainSwiperRef.current = s; }}
              >
                {slides.map((slide, i) => (
                  <SwiperSlide key={slide._id || i}>
                    <div className={`ul-banner-slide${i === 1 ? ' ul-banner-slide--2' : i === 2 ? ' ul-banner-slide--3' : ''}`}>
                      <div className="ul-banner-slide-img">
                        <img
                          src={slide.image}
                          alt={slide.heading}
                          style={{ display: 'block' }}
                        />
                      </div>
                      <div className="ul-banner-slide-txt">
                        {slide.subHeading && (
                          <span className="ul-banner-slide-sub-title">
                            {slide.subHeading}
                          </span>
                        )}
                        {slide.heading && (
                          <h1 className="ul-banner-slide-title">
                            {slide.heading}
                          </h1>
                        )}
                        {(slide.price || slide.description) && (
                          <p className="ul-banner-slide-price">
                            {slide.pricePrefix && <>{slide.pricePrefix}{' '}</>}
                            <span className="price">{slide.price || slide.description}</span>
                          </p>
                        )}
                        {slide.buttonText && (
                          <Link to={slide.buttonLink || '/shop'} className="ul-btn">
                            {slide.buttonText}{' '}
                            <i className="bi bi-arrow-up-right"></i>
                          </Link>
                        )}
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>

              {/* Prev/Next nav buttons — positioned inside the slide */}
              <div className="ul-banner-slider-nav-wrapper">
                <div className="ul-banner-slider-nav">
                  <button className="prev">
                    <span className="icon"><i className="bi bi-chevron-up"></i></span>
                  </button>
                  <button className="next">
                    <span className="icon"><i className="bi bi-chevron-down"></i></span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Thumbnail image slider — horizontal, slidesPerView 1.4, synced as thumbs */}
          <div className="ul-banner-img-slider-wrapper">
            <div className="ul-banner-img-slider">
              <Swiper
                key={`thumb-${slidesKey}`}
                modules={[Autoplay, Thumbs]}
                onSwiper={setThumbsSwiper}
                loop
                autoplay={{ delay: 4000, disableOnInteraction: false }}
                slidesPerView={1.4}
                spaceBetween={15}
                watchSlidesProgress
                breakpoints={{
                  992: { spaceBetween: 15 },
                  1680: { spaceBetween: 26 },
                  1700: { spaceBetween: 30 },
                }}
                style={{ height: '100%' }}
              >
                {slides.map((slide, i) => (
                  <SwiperSlide key={slide._id || i}>
                    <img
                      src={slide.thumbImage || slide.image}
                      alt={slide.heading}
                      style={{ cursor: 'pointer' }}
                      onClick={() => mainSwiperRef.current?.slideTo(i + 1)}
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>

        </section>
      </div>
    </div>
  );
}