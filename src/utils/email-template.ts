export const emailTemplate = `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chinesemeggie buying product comfirmation</title>
</head>
<style>
    @media (width <=420px) {
        body {
            font-size: 12px !important;
        }
    }
</style>

<body
    style="font-family: Arial, Helvetica, sans-serif; padding: 0; margin: 0; box-sizing: border-box; font-size: 14px;">
    <main style="width: 100%; max-width: 600px; margin: auto; border: 1px solid rgb(240, 240, 240);
        box-shadow: rgba(67, 67, 67, 0.09) 0px 20px 30px;
        ">
        <header style="padding-block: 0.2rem; background: #6E9FB8;">
            <h4 style="text-align: center; color: white;">Informasi pembelian produk</h4>
        </header>
        <section
            style="display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 1rem; padding-inline: 1rem;">
            <div style="max-width: 420px; height: 200px; padding-top: 1rem;">
                <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRdVm_ywe9-CkGyyxRXfc8mOM40qA7MX2Wd1Q&s"
                    alt="product-image" style="width: 100%; height: 100%; object-fit: contain;" />
            </div>
            <div class="content">
                <p style="padding-block: 0.5rem;">Halo Hendri Alqori</p>
                <p style="padding-block: 0.5rem;">Terima kasih banyak atas pembelian eBook <span
                        style="font-weight: 600;">ChinesewithMeggie Special
                        Edition</span>. Kami sangat menghargai
                    kepercayaan Anda dalam memilih eBook ini sebagai bagian dari perjalanan belajar Anda.</p>
                <p style="padding-block: 0.5rem;">Kami berharap eBook ini dapat membantu Anda mencapai tujuan belajar
                    bahasa Mandarin dengan lebih
                    efektif
                    dan menyenangkan. Jika ada pertanyaan atau saran terkait eBook ini, jangan ragu untuk menghubungi
                    kami.
                    Kami selalu siap membantu.</p>
                <p style="padding-block: 0.5rem;">Sekali lagi, terima kasih atas dukungannya, dan selamat belajar dengan
                    eBook <span style="font-weight: 600;">ChinesewithMeggie
                        Special
                        Edition!</span></p>

                <p style="padding-block: 0.5rem;">Salam hangat, <br>
                    <span style="font-weight: 700;">chinesewithmeggie</span>
                </p>

                <div
                    style="display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 0.5rem;">
                    <a href="" target="_blank" referrerpolicy="no-referrer"
                        style="text-decoration: none; background-color: #6E9FB8;
                         color: #ffffff;  padding: 0.7rem 1rem 0.7rem 1rem ; border-radius: .2rem; transform: background; transition-duration: 0.3s;">
                        Akses konten disini!
                    </a>
                    <span style="font-size: 12.5px; color: gray;">tombol bermasalah ? copy link di bawah</span>
                    <p style="text-align: center; text-decoration: underline;">
                        https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRdVm_ywe9-CkGyyxRXfc8mOM40qA7MX2Wd1Q&s</p>
                </div>
            </div>
        </section>
        <footer style="padding-block: 1.6rem; background-color: #000000;">
            <p style="color: #ffffff; text-align: center;">Copyright © 2024 | chinesewithmeggie</p>
        </footer>
    </main>
</body>

</html>
`