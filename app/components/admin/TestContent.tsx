"use client";

import { FC, useState, ChangeEvent } from "react";
import { Plus, Edit2, Trash2, Search, Clock } from "lucide-react";
import { ReadingTest, ListeningTest } from "@/types";
import { AddTestModal } from "./AddTestModal";
import { EditTestModal } from "./EditTestModal";
import { AddListeningTestModal } from "./ListeningModal";

interface TestsContentProps {
  type: "reading" | "listening";
  tests: Array<ReadingTest | ListeningTest>;
  loading: boolean;
  onDelete: (id: string) => void;
  onRefresh: () => void;
}

export const TestsContent: FC<TestsContentProps> = ({
  type,
  tests,
  loading,
  onDelete,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterDifficulty, setFilterDifficulty] = useState<
    "" | "easy" | "medium" | "hard"
  >("");
  const [showModal, setShowModal] = useState(false);
  const [editingTest, setEditingTest] = useState<ReadingTest | null>(null);

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) =>
    setSearchTerm(e.target.value);

  // Helper function to get test title
  const getTestTitle = (test: ReadingTest | ListeningTest): string => {
    return test.testName || test.title || "Untitled Test";
  };

  // Helper function to normalize difficulty
  const normalizeDifficulty = (difficulty: string): string => {
    return difficulty.toLowerCase();
  };

  const filteredTests = tests.filter((test) => {
    const testTitle = getTestTitle(test);
    const titleMatch = testTitle
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const testDifficulty = normalizeDifficulty(test.difficulty);
    const difficultyMatch =
      filterDifficulty === "" || testDifficulty === filterDifficulty;

    return Boolean(titleMatch && difficultyMatch);
  });

  const handleEdit = (test: ReadingTest | ListeningTest) => {
    if (type === "reading") {
      setEditingTest(test as ReadingTest);
    }
  };

  const handleEditSuccess = () => {
    setEditingTest(null);
    onRefresh();
  };

  // Type guard
  const isReading = (t: ReadingTest | ListeningTest): t is ReadingTest =>
    (t as ReadingTest).passages !== undefined;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2 capitalize">
            {type} Tests
          </h2>
          <p className="text-gray-600">Manage your {type} test collection</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-all shadow-md"
        >
          <Plus size={20} />
          Add New Test
        </button>
      </div>

      <div className="bg-white rounded-xl p-4 mb-6 flex gap-4 flex-wrap border border-gray-200 shadow-sm">
        <div className="flex-1 min-w-64">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search tests..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <select
          value={filterDifficulty}
          onChange={(e) =>
            setFilterDifficulty(
              e.target.value as "" | "easy" | "medium" | "hard"
            )
          }
          className="px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Difficulties</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredTests.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
              <p className="text-gray-500 text-lg">No tests found</p>
              <p className="text-gray-400 text-sm mt-2">
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            filteredTests.map((test) => {
              const testTitle = getTestTitle(test);
              const displayDifficulty =
                test.difficulty.charAt(0).toUpperCase() +
                test.difficulty.slice(1);

              return (
                <div
                  key={test._id}
                  className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">
                        {testTitle}
                      </h3>
                      <div className="flex gap-3 text-sm flex-wrap">
                        <span
                          className={`px-3 py-1 rounded-full font-medium ${
                            normalizeDifficulty(test.difficulty) === "easy"
                              ? "bg-green-100 text-green-700"
                              : normalizeDifficulty(test.difficulty) ===
                                "medium"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {displayDifficulty}
                        </span>

                        {test.testType && (
                          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                            {test.testType}
                          </span>
                        )}

                        <span className="text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                          {isReading(test)
                            ? `${test.passages?.length || 0} passages`
                            : `${
                                (test as ListeningTest).sections?.length || 0
                              } sections`}
                        </span>

                        <span className="text-gray-600 bg-gray-100 px-3 py-1 rounded-full flex items-center gap-1">
                          <Clock className="inline" size={14} />
                          <span>{test.timeLimit} min</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(test)}
                        className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-all"
                      >
                        <Edit2 size={18} />
                      </button>

                      <button
                        onClick={() => onDelete(test._id)}
                        className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {showModal && type === "reading" && (
        <AddTestModal
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            onRefresh();
          }}
        />
      )}
      {showModal && type === "listening" && (
        <AddListeningTestModal
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            onRefresh();
          }}
        />
      )}
      {editingTest && (
        <EditTestModal
          test={editingTest as any}
          onClose={() => setEditingTest(null)}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
};
