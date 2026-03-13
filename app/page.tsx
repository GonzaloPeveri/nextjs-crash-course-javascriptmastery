import EventCard from "@/components/EventCard"
import ExploreBtn from "@/components/ExploreBtn"
import { IEvent } from "@/database";
import { cacheLife } from "next/cache";

import { getAllEvents } from "@/lib/actions/event.actions";

const page = async () => {
  'use cache';
  cacheLife('minutes');

  const events = await getAllEvents();
  return (
    <section>
      <h1 className="text-center">The Hub for Every Dev<br />Event You Can&apos;t Miss</h1>
      <p className="text-center mt-5">Hackatons, Meetups and Conferences, All in One Place</p>

      <ExploreBtn />

      <div className="mt-20 space-y-7">
        <h3>Featured Events</h3>
        <ul className="events">
          {events && events.length > 0 && events.map((event: IEvent) => (

            event.visible ? (
              <li key={event.title} className="list-none">
                <EventCard {...event} />
              </li>
            ) : null

          ))}
        </ul>
      </div>
    </section>
  )
}

export default page