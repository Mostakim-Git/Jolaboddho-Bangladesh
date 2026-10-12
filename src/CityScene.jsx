export default function CityScene() {
  return (
    <svg
      className="city-scene"
      viewBox="0 0 600 350"
      fill="none"
      role="img"
      aria-label="Illustration of a greener Bangladeshi neighborhood with a canal and connected citizen reports"
    >
      <defs>
        <linearGradient
          id="water"
          x1="140"
          y1="220"
          x2="420"
          y2="330"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#73c3c2" />
          <stop offset="1" stopColor="#3d969c" />
        </linearGradient>
        <linearGradient id="ground" x1="100" y1="160" x2="500" y2="320">
          <stop stopColor="#d9e6d1" />
          <stop offset="1" stopColor="#b9d7be" />
        </linearGradient>
        <filter id="shadow">
          <feDropShadow
            dx="0"
            dy="10"
            stdDeviation="12"
            floodColor="#1b6155"
            floodOpacity=".12"
          />
        </filter>
      </defs>
      <ellipse
        cx="314"
        cy="301"
        rx="223"
        ry="30"
        fill="#b9d3c4"
        opacity=".25"
      />
      <g opacity=".5" stroke="#9cbbb0" strokeWidth="1.5">
        <path d="M102 85v9m0 8v4M474 64v9m0 8v4M531 135v9M204 38v9M395 29v9M80 160v8M442 26v8" />
      </g>
      <path d="M66 214 315 90 551 215 303 344Z" fill="#a4c3ae" />
      <path d="M66 205 315 81 551 206 303 334Z" fill="url(#ground)" />
      <path
        d="m128 235 60-30 51 25 60-31 95 49-66 35 55 29-51 26Z"
        fill="url(#water)"
      />
      <path d="m94 191 44-22 207 109-44 24Z" fill="#f3eee2" />
      <path d="m247 115 25-13 249 133-25 13Z" fill="#f4eee0" />
      <path d="m214 275 37 19 223-118-36-19Z" fill="#f2ede2" />
      <path d="m251 294 223-118" stroke="#afbdad" strokeWidth="2" />
      <path
        d="m150 247 24 12m19 10 21 11m88 23 21 11M341 255l17 9m-140-33 11 6"
        stroke="#b2e1de"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <g filter="url(#shadow)">
        <path d="m154 151 64 34 1-91-65-34Z" fill="#f3e9d2" />
        <path d="m219 185 54-28V66l-54 28Z" fill="#cfdbc7" />
        <path d="m154 60 65 34 54-28-64-34Z" fill="#fff6e2" />
        <path d="m163 58 47-23 51 28-43 23Z" fill="#bad0bd" />
        <path
          d="m164 83 12 6v16l-12-6Zm25 13 12 6v16l-12-6Zm-25 15 12 6v16l-12-6Zm25 13 12 6v16l-12-6Zm-25 15 12 6v16l-12-6Z"
          fill="#759b92"
        />
        <path
          d="m231 103 11-6v16l-11 6Zm19-10 11-6v16l-11 6Zm-19 37 11-6v16l-11 6Zm19-10 11-6v16l-11 6Z"
          fill="#65988b"
        />
        <path d="m190 155 14 7v16l-14-7Z" fill="#446f65" />
        <path d="m287 164 55 29v-67l-55-29Z" fill="#faf1da" />
        <path d="m342 193 47-24v-66l-47 23Z" fill="#d6dac0" />
        <path d="m283 96 60 31 50-25-58-31Z" fill="#539184" />
        <path
          d="m297 119 13 7v15l-13-7Zm23 12 12 6v15l-12-6Zm-23 15 13 7v15l-13-7Z"
          fill="#8ba49a"
        />
        <path d="m353 137 11-6v15l-11 6Zm16-8 11-6v15l-11 6Z" fill="#749788" />
        <path d="m321 161 12 7v19l-12-7Z" fill="#3d7066" />
        <path d="m404 194 47 25v-48l-47-25Z" fill="#eee3c9" />
        <path d="m451 219 41-21v-48l-41 21Z" fill="#c7d2b8" />
        <path d="m396 145 56 29 47-25-55-29Z" fill="#ca9a66" />
        <path d="m408 145 36-19 42 23-34 18Z" fill="#e5b67f" />
        <path d="m414 166 11 6v15l-11-6Zm21 12 9 4v15l-9-4Z" fill="#6d9186" />
        <path d="m466 179 13-7v20l-13 7Z" fill="#64877b" />
      </g>
      <g stroke="#688b68" strokeWidth="4">
        <path d="M127 170v-43M279 214v-43M397 118V78M484 240v-40M370 293v-35M112 219v-26" />
      </g>
      <g fill="#629b77">
        <ellipse cx="126" cy="129" rx="20" ry="29" />
        <ellipse cx="278" cy="172" rx="17" ry="25" />
        <ellipse cx="397" cy="77" rx="17" ry="27" />
        <ellipse cx="484" cy="200" rx="18" ry="25" />
        <ellipse cx="370" cy="259" rx="16" ry="23" />
        <ellipse cx="111" cy="190" rx="13" ry="21" />
      </g>
      <g fill="#85b58c">
        <ellipse cx="119" cy="124" rx="12" ry="22" />
        <ellipse cx="272" cy="168" rx="10" ry="19" />
        <ellipse cx="391" cy="73" rx="10" ry="20" />
        <ellipse cx="479" cy="195" rx="10" ry="19" />
        <ellipse cx="365" cy="255" rx="10" ry="17" />
      </g>
      <path d="m239 269 39 20 52-28-39-20Z" fill="#e3d7bc" />
      <path
        d="m239 263 39 20 52-28m-91 16 39 20 52-28"
        stroke="#657e71"
        strokeWidth="3"
      />
      <path
        d="M242 264v11m12-5v11m12-5v11m13-5v10m13-17v10m13-17v10m13-17v10"
        stroke="#657e71"
        strokeWidth="2"
      />
      <g>
        <path
          d="M307 228v12m0-6-4 7m4-7 5 4"
          stroke="#334f50"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M307 223v10"
          stroke="#e2a75d"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <circle cx="307" cy="217" r="3" fill="#795b43" />
        <path
          d="M202 218v10m0-5-3 8m3-8 4 7"
          stroke="#334f50"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M202 213v10"
          stroke="#258881"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <circle cx="202" cy="207" r="3" fill="#795b43" />
      </g>
      <g transform="translate(321 31)" filter="url(#shadow)">
        <path
          d="M0 17a23 23 0 1 1 46 0c0 18-23 37-23 37S0 35 0 17Z"
          fill="#087d73"
        />
        <circle cx="23" cy="17" r="10" fill="#f2faf5" />
        <path
          d="m18 17 4 4 7-8"
          stroke="#087d73"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <g transform="translate(403 78)">
        <rect width="145" height="38" rx="12" fill="#fffdf7" stroke="#dce7dc" />
        <circle cx="20" cy="19" r="5" fill="#168b73" />
        <text
          x="33"
          y="23"
          fontFamily="system-ui,sans-serif"
          fontSize="10"
          fontWeight="600"
          fill="#31514b"
        >
          Better, together.
        </text>
      </g>
      <g transform="translate(61 263)">
        <rect width="150" height="42" rx="12" fill="#fffdf7" stroke="#dce7dc" />
        <circle cx="22" cy="21" r="11" fill="#f6e9bf" />
        <path
          d="M22 15v7m0 4v1"
          stroke="#ac8745"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <text
          x="41"
          y="25"
          fontFamily="system-ui,sans-serif"
          fontSize="10"
          fontWeight="600"
          fill="#31514b"
        >
          Every report matters.
        </text>
      </g>
    </svg>
  );
}
