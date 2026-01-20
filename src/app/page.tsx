export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-secondary to-muted">
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="text-center space-y-8 max-w-3xl">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold text-balance">
              WordBeetle
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground text-balance">
              あなたの語学学習をサポートする単語帳アプリ
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="bg-card rounded-lg p-6 border-2 shadow-lg">
              <div className="text-3xl mb-3">📚</div>
              <h3 className="font-semibold text-lg mb-2">豊富な単語帳</h3>
              <p className="text-sm text-muted-foreground">
                自分だけの単語帳を作成して効率的に学習
              </p>
            </div>

            <div className="bg-card rounded-lg p-6 border-2 shadow-lg">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="font-semibold text-lg mb-2">スマート復習</h3>
              <p className="text-sm text-muted-foreground">
                忘却曲線に基づいた最適な復習タイミング
              </p>
            </div>

            <div className="bg-card rounded-lg p-6 border-2 shadow-lg">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="font-semibold text-lg mb-2">学習記録</h3>
              <p className="text-sm text-muted-foreground">
                進捗を可視化してモチベーションを維持
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
