"use client";

import Image from "next/image";

export default function HistorySection() {
    return (
        <section className="py-16 md:py-24 bg-white">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto text-center mb-12">
                    <span className="badge bg-primary/10 text-primary mb-4">Our Journey</span>
                    <h2 className="text-3xl md:text-4xl font-bold text-primary-900 mb-6">
                        The First General Meeting
                    </h2>
                    <p className="text-lg text-gray-600">
                        A historic moment for vision sciences in Pakistan. The gathering that started it all, bringing together the brightest minds to form the Society of Optometrists, Orthoptists and Ophthalmic Technologists.
                    </p>
                </div>

                <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden shadow-2xl">
                    <Image
                        src="/images/first-general-meeting.jpg"
                        alt="SOOOP First General Meeting Group Photo"
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end">
                        <div className="p-8 text-white">
                            <p className="font-semibold text-lg">Inaugural Meeting at Children's Hospital Lahore</p>
                            <p className="text-white/80 text-sm">Founding members and visionaries unites.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
