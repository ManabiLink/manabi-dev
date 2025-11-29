// ログイン画面
/* 入力内容
- メールアドレス
- パスワード
*/

export default function LoginPage() {
  return (
    <div>
      <h1>ログインページ</h1>
      <form>
        <label>
          メールアドレス:
          <input type="email" name="email" required />
        </label>
        <br />
        <label>
          パスワード:
          <input type="password" name="password" required />
        </label>
        <br />
        <button type="submit">ログイン</button>
      </form>
    </div>
  );
}   