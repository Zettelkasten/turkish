# how to align?

```
paste -d "\t" <(cat data/Tatoeba.en-tr.tr data/Tatoeba.en-tr.tr | ./preprocessing.py --lang tr) <(cat data/Tatoeba.en-tr.en | ./preprocessing.py --lang en) | sed "s/\t/ ||| /g" | head -n 10000 > tatoeba_head10k.tr-en
```

```
awesome-align --output_file tatoeba_head10k.tr-en.aligned --model_name_or_path awesome-align/model_without_co --data_file tatoeba_head10k.tr-en --extraction 'softmax' --batch_size 32 --num_workers 0 --output_word_file tatoeba_head10k.tr-en.aligned.words --output_prob_file tatoeba_head10k.tr-en.aligned.probs
```