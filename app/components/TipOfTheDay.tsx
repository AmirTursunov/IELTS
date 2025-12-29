import { Zap } from "lucide-react";

export default function TipOfTheDay() {
  const tipsWithVideos = [
    {
      tip: "Practice speaking for at least 15 minutes daily. Record yourself and listen back to identify areas for improvement! 🎤",
      video: "https://youtu.be/topBLaz4zgk?si=xMx5qgOia5QKVmUz", // English Speaking Practice
    },
    {
      tip: "Read an English article every day and summarize it in your own words. 📰",
      // video: "https://www.youtube.com/watch?v=vJvYxS3D1VQ", // English Reading Comprehension
    },
    {
      tip: "Learn 5 new vocabulary words each day and use them in sentences. ✏️",
      // video: "https://www.youtube.com/watch?v=l2o5gGmnyhg", // Daily Vocabulary Tips
    },
    {
      tip: "Listen to an English podcast and try shadowing the speaker. 🎧",
      video: "https://youtu.be/P26AE7NLx4Q?si=_x92vmR7W-RosLYg", // Shadowing English Podcast
    },
    {
      tip: "Write a short diary entry in English daily. 📝",
      // video: "https://www.youtube.com/watch?v=R2nS6rQWbIc", // English Writing Practice
    },
    {
      tip: "Practice pronunciation using tongue twisters.",
      video: "https://youtu.be/xPXu5GoUHH0?si=w_LLhWSHnCZXS_1h", // English Tongue Twisters
    },
    {
      tip: "Watch a short English video and try to mimic the dialogue. 🎬",
      video: "https://youtu.be/Y681hXWwhQY?si=f7iumZI8zUu8JKa7", // English Dialogue Practice
    },
    {
      tip: "Review your mistakes from previous tests and focus on weak areas. 📊",
      // video: "https://www.youtube.com/watch?v=0qPZ6vFN4jo", // IELTS / Exam Review Tips
    },
    {
      tip: "Join an English speaking club or online group to practice conversation. 🤝",
      // video: "https://www.youtube.com/watch?v=E-8_EHzBykI", // Online English Speaking Group
    },
    {
      tip: "Set a small daily goal for reading, writing, listening, or speaking. 🎯",
      // video: "https://www.youtube.com/watch?v=ZYQTrBgrSUI", // Setting Daily English Goals
    },
  ];

  const today = new Date();
  const tipIndex = today.getDate() % tipsWithVideos.length;
  const tipOfTheDay = tipsWithVideos[tipIndex];

  return (
    <div className="bg-linear-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border-2 border-yellow-200 shadow-lg">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-2 bg-yellow-400 rounded-lg">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <h3 className="font-black text-gray-900">Tip of the Day</h3>
      </div>
      <p className="text-sm text-gray-700 leading-relaxed">
        {tipsWithVideos[tipIndex].tip}
        <br />
        {tipOfTheDay.video && (
          <a
            href={tipsWithVideos[tipIndex].video}
            target="_blank"
            className="text-blue-600 underline"
          >
            Watch Video 🎥
          </a>
        )}
      </p>
    </div>
  );
}
